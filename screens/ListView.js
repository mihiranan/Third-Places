import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { supabase } from "../supabase";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { savePlace, unsavePlace } from "../store";
import * as Font from "expo-font";

const CATEGORY_COLORS = {
  food: "#ff915a",
  nightlife: "#79256c",
  outdoors: "#00bf63",
  workspace: "#df366e",
  discover: "#0cc0df",
};

Font.loadAsync({
  FredokaBold: require("../assets/fonts/Fredoka-Bold.ttf"),
  Fredoka: require("../assets/fonts/Fredoka-Regular.ttf"),
  FredokaSemibold: require("../assets/fonts/Fredoka-SemiBold.ttf"),
});

const ListViewScreen = ({
  navigation,
  selectedCategory,
  onItemPress,
  filteredPlaces: searchResults,
}) => {
  const [places, setPlaces] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState({});
  const [likedPlaces, setLikedPlaces] = useState({});
  const dispatch = useDispatch();
  const savedPlaces = useSelector((state) => state.savedPlaces || []);

  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from("Places")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        Alert.alert("Error fetching places", error.message);
      } else {
        setPlaces(data);
      }
    } catch (error) {
      Alert.alert("Unexpected error", error.message);
    }
  };

  const handleLike = async (id) => {
    const isLiked = likedPlaces[id];
    const currentPlace = places.find((place) => place.id === id);
    const newLikesCount = isLiked
      ? (currentPlace.likes || 0) - 1
      : (currentPlace.likes || 0) + 1;

    setLikedPlaces((prev) => ({ ...prev, [id]: !isLiked }));
    setPlaces((prev) =>
      prev.map((place) =>
        place.id === id ? { ...place, likes: newLikesCount } : place
      )
    );

    try {
      const { error } = await supabase
        .from("Places")
        .update({ likes: newLikesCount })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      setLikedPlaces((prev) => ({ ...prev, [id]: isLiked }));
      setPlaces((prev) =>
        prev.map((place) =>
          place.id === id ? { ...place, likes: currentPlace.likes } : place
        )
      );
      Alert.alert("Error", "Failed to update likes: " + error.message);
    }
  };

  const handleSave = (id) => {
    const currentPlace = places.find((place) => place.id === id);
    const isSaved =
      Array.isArray(savedPlaces) &&
      savedPlaces.some((place) => place.id === currentPlace.id);

    if (isSaved) {
      dispatch(unsavePlace(currentPlace));
    } else {
      dispatch(savePlace(currentPlace));
    }
  };

  useEffect(() => {
    fetchPlaces();

    const interval =
      selectedCategory === "all" ? setInterval(fetchPlaces, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      setPlaces([]);
      setLoadingLikes({});
      setLikedPlaces({});
    };
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredPlaces = useMemo(() => {
    if (searchResults && searchResults.length > 0) {
      return searchResults;
    }
    return places.filter((place) =>
      selectedCategory === "all"
        ? true
        : place.category.toLowerCase() === selectedCategory
    );
  }, [places, selectedCategory, searchResults]);

  const renderItem = ({ item }) => {
    const backgroundColor =
      CATEGORY_COLORS[item.category.toLowerCase()] || "#000000";

    const isSaved =
      Array.isArray(savedPlaces) &&
      savedPlaces.some((place) => place.id === item.id);
    return (
      <TouchableOpacity onPress={() => onItemPress(item)}>
        <Animated.View
          style={[
            styles.itemContainer,
            { backgroundColor },
            { opacity: fadeAnim },
          ]}
        >
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.itemTimestamp}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
          <View style={styles.likesContainer}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleSave(item.id)}
              disabled={loadingLikes[item.id]}
            >
              {loadingLikes[item.id] ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={isSaved ? "#ffd700" : "#fff"}
                />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
        windowSize={5}
      />
    </View>
  );
};

export default ListViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ed",
  },
  list: {
    marginTop: 250,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
    color: "#ffffff",
    fontFamily: "Fredoka",
  },
  itemDescription: {
    fontSize: 14,
    color: "#e8e8e8",
    marginBottom: 8,
    lineHeight: 18,
    fontFamily: "Fredoka",
  },
  itemTimestamp: {
    fontSize: 12,
    color: "#ffffff",
  },
  bookmarkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookmarkButton: {
    marginRight: 6,
  },
  likeCount: {
    fontSize: 14,
    color: "#ffffff",
  },
});
