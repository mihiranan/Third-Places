import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { supabase } from "../supabase";
import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_ORGANIZATION_ID } from "@env";
import Header from "../components/Header";
import debounce from "lodash.debounce";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION_ID,
});

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

export const searchPlaces = debounce(async (query, setFilteredPlaces) => {
  if (query.trim().length === 0) {
    setFilteredPlaces([]);
    return;
  }
  if (query.length < 3) {
    setFilteredPlaces([]);
    return;
  }

  try {
    console.log(query);
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: query,
    });
    const searchEmbedding = embeddingResponse.data[0].embedding;

    const { data: places, error } = await supabase.from("Places").select("*");
    if (error) {
      console.error("Error fetching places:", error);
      return;
    }

    const validPlaces = places.filter((place) => place.embedding !== null);
    const rankedResults = validPlaces
      .map((place) => ({
        ...place,
        similarity: cosineSimilarity(searchEmbedding, place.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    setFilteredPlaces(rankedResults);
  } catch (error) {
    console.error("Error searching places:", error);
  }
}, 500);

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  return (
    <View style={styles.container}>
      <Header title="search" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search for places"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          searchPlaces(text);
        }}
      />
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => {
                setSelectedPlace(item);
                setSearchResults([]);
              }}
            >
              <Text style={styles.placeName}>{item.name}</Text>
              <Text style={styles.placeAddress}>{item.address}</Text>
            </TouchableOpacity>
          )}
          style={styles.resultsList}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8e8e8",
    padding: 15,
    paddingTop: 120,
  },
  searchInput: {
    height: 50,
    fontSize: 16,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  placeName: {
    fontSize: 16,
    fontWeight: "500",
  },
  placeAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});
