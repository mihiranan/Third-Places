import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import { supabase } from "../supabase";
import * as Font from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";

Font.loadAsync({
  FredokaBold: require("../assets/fonts/Fredoka-Bold.ttf"),
  Fredoka: require("../assets/fonts/Fredoka-Regular.ttf"),
  FredokaSemibold: require("../assets/fonts/Fredoka-SemiBold.ttf"),
});

const categories = [
  { id: 1, name: "Food" },
  { id: 2, name: "Nightlife" },
  { id: 3, name: "Outdoors" },
  { id: 4, name: "Workspace" },
  { id: 5, name: "Discover" },
];

const CATEGORY_COLORS = {
  food: "#ff915a",
  nightlife: "#79256c",
  outdoors: "#00bf63",
  workspace: "#df366e",
  discover: "#0cc0df",
};

const CATEGORY_ICONS = {
  food: "food",
  nightlife: "party-popper",
  outdoors: "tree",
  workspace: "desk-lamp",
  discover: "compass",
};

const STANFORD_LOCATION = {
  lat: 37.4275,
  lng: -122.1697,
};

const NewPostScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const key = "AIzaSyDRI5wZERbcmVUPzVlUvkg_QvZugcrff8Y";
  const searchPlaces = async (query) => {
    if (query.length < 3) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          query
        )}&location=${STANFORD_LOCATION.lat},${
          STANFORD_LOCATION.lng
        }&radius=5000&locationbias=circle:5000@${STANFORD_LOCATION.lat},${
          STANFORD_LOCATION.lng
        }&key=${key}`
      );

      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error("Failed to fetch places");
      }

      const formattedResults = data.results.map((item) => ({
        place_id: item.place_id,
        name: item.name,
        address: item.formatted_address,
        geometry: item.geometry,
      }));

      setSearchResults(formattedResults);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching places:", error);
      Alert.alert("Error", "Unable to fetch places. Please try again later.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    if (!selectedCategory || !selectedPlace) {
      Alert.alert("Error", "Please select both a place and category");
      return;
    }

    try {
      const { error } = await supabase.from("Places").insert([
        {
          name: selectedPlace.name,
          address: selectedPlace.address,
          category: selectedCategory.name,
          description: description,
          latitude: selectedPlace.geometry.location.lat,
          longitude: selectedPlace.geometry.location.lng,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Place added successfully!");
      setSelectedPlace(null);
      setSelectedCategory(null);
      setDescription("");
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding place:", error);
      Alert.alert("Error", "Failed to add place. Please try again.");
    }
  };

  const handleTextChange = (text) => {
    setSearchQuery(text);
    if (text === "") {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Add Third Place"
        titleStyle={{ fontFamily: "Fredoka", fontSize: 24, color: "#000" }}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, styles.text]}
          placeholder="Search for a place..."
          value={searchQuery}
          onChangeText={handleTextChange}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            if (searchQuery.length >= 3) {
              searchPlaces(searchQuery);
              setHasSearched(true);
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="search" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.descriptionContainer}>
        {selectedPlace && (
          <View style={styles.selectedPlaceContainer}>
            <Text style={[styles.selectedPlaceText, styles.text]}>
              Selected: {selectedPlace.name}
            </Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a description..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </View>
      <View style={styles.resultsContainer}>
        {(!hasSearched || searchQuery === "") && (
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, styles.text]}>
              No results yet
            </Text>
          </View>
        )}
        {hasSearched && searchQuery !== "" && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                  setSelectedPlace(item);
                  setSearchResults([]);
                }}
              >
                <Text style={[styles.placeName, styles.text]}>
                  {item.name || "Unknown Place"}
                </Text>
                <Text style={[styles.placeAddress, styles.text]}>
                  {item.address}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 150 }}
          />
        )}
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: category }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      selectedCategory?.id === category.id
                        ? CATEGORY_COLORS[category.name.toLowerCase()]
                        : "#f0f0f0",
                  },
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory?.id === category.id ? null : category
                  )
                }
              >
                <MaterialCommunityIcons
                  name={CATEGORY_ICONS[category.name.toLowerCase()]}
                  size={20}
                  color={selectedCategory?.id === category.id ? "#fff" : "#666"}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.categoryText,
                    styles.text,
                    selectedCategory?.id === category.id && { color: "#fff" },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.postButton,
            (!selectedCategory || !selectedPlace) && styles.disabledButton,
          ]}
          onPress={handlePost}
          disabled={!selectedCategory || !selectedPlace}
        >
          <Text style={[styles.postButtonText, styles.text]}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ed",
  },
  textBold: {
    fontFamily: "FredokaBold",
  },
  textSemiBold: {
    fontFamily: "FredokaSemibold",
  },
  text: {
    fontFamily: "Fredoka",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: Platform.OS === "ios" ? 120 : StatusBar.currentHeight + 70,
    alignItems: "center",
    backgroundColor: "#f7f4ed",
  },
  descriptionContainer: {
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#dedede",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#0cc0df",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginBottom: 200,
  },
  resultItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  placeName: { fontSize: 16, fontWeight: "500" },
  placeAddress: { fontSize: 14, color: "#666", marginTop: 2 },
  selectedPlaceContainer: {
    paddingVertical: 15,
    marginBottom: 20,
  },
  selectedPlaceText: { fontSize: 16, fontWeight: "500" },
  descriptionInput: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dedede",
    minHeight: 80,
    textAlignVertical: "top",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: "#f7f4ed",
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f7f4ed",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#dedede",
  },
  categoryText: { fontSize: 14, color: "#666666" },
  postButton: {
    marginTop: 10,
    marginHorizontal: 15,
    backgroundColor: "#0cc0df",
    padding: 15,
    borderRadius: 100,
    alignItems: "center",
  },
  disabledButton: { backgroundColor: "#ccc" },
  postButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#000",
    fontWeight: "500",
    fontSize: 18,
  },
});

export default NewPostScreen;
