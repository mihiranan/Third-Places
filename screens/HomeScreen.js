import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import Header from "../components/Header";
import MapViewScreen from "./MapView";
import { searchPlaces } from "./Search";
import ListViewScreen from "./ListView";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Font from "expo-font";

const CATEGORIES = [
  { id: "all", name: "All", color: "#000000" },
  { id: "food", name: "Food", color: "#ff915a" },
  { id: "nightlife", name: "Nightlife", color: "#79256c" },
  { id: "outdoors", name: "Outdoors", color: "#00bf63" },
  { id: "workspace", name: "Workspace", color: "#df366e" },
  { id: "discover", name: "Discover", color: "#0cc0df" },
];

const CATEGORY_ICONS = {
  food: "food",
  nightlife: "party-popper",
  outdoors: "tree",
  workspace: "desk-lamp",
  discover: "compass",
  all: "apps",
};

const screenWidth = Dimensions.get("window").width;

Font.loadAsync({
  FredokaBold: require("../assets/fonts/Fredoka-Bold.ttf"),
  Fredoka: require("../assets/fonts/Fredoka-Regular.ttf"),
  FredokaSemibold: require("../assets/fonts/Fredoka-SemiBold.ttf"),
});

const HomeScreen = ({ navigation }) => {
  const [selectedView, setSelectedView] = useState("Map");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewTransition] = useState(
    new Animated.Value(selectedView === "Map" ? 1 : 0)
  );
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  const debouncedSetCategory = useCallback(
    (category) => {
      if (selectedCategory === category && category !== "all") {
        setSelectedCategory("all");
      } else {
        setSelectedCategory(category);
      }
    },
    [selectedCategory]
  );

  const handleListItemPress = (place) => {
    setSelectedView("Map");
    setTimeout(() => {
      setSelectedPlace(place);
    }, 300);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setFilteredPlaces([]);
    } else {
      searchPlaces(query, setFilteredPlaces);
    }
  };

  useEffect(() => {
    Animated.timing(viewTransition, {
      toValue: selectedView === "Map" ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedView]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="">
        <View style={styles.headerControls}>
          {/* Title and Toggle Buttons Row */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Image
                source={require("../assets/pinLogo.png")}
                style={styles.logo}
              />
              <Text style={styles.headerTitle}>third places</Text>
            </View>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedView === "Map" && styles.selectedButton,
                ]}
                onPress={() => setSelectedView("Map")}
              >
                <View style={styles.buttonContent}>
                  <FontAwesomeIcon
                    icon={faMap}
                    color={selectedView === "Map" ? "#fff" : "#000"}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      selectedView === "Map" && styles.selectedText,
                    ]}
                  >
                    Map
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedView === "List" && styles.selectedButton,
                ]}
                onPress={() => setSelectedView("List")}
              >
                <View style={styles.buttonContent}>
                  <FontAwesomeIcon
                    icon={faBarsStaggered}
                    color={selectedView === "List" ? "#fff" : "#000"}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      selectedView === "List" && styles.selectedText,
                    ]}
                  >
                    List
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories ScrollView */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
            contentContainerStyle={styles.categoryContent}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && {
                    backgroundColor: category.color,
                  },
                ]}
                onPress={() => debouncedSetCategory(category.id)}
              >
                <View style={styles.buttonContent}>
                  <Icon
                    name={
                      CATEGORY_ICONS[category.id.toLowerCase()] || "help-circle"
                    }
                    size={16}
                    color={
                      selectedCategory === category.id ? "#fff" : "#666666"
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.selectedCategoryText,
                      selectedCategory === category.id && { fontWeight: "700" },
                    ]}
                  >
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for places"
            value={searchQuery}
            onChangeText={(text) => handleSearch(text)}
          />
        </View>
      </Header>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[
            { flex: 1, position: "absolute", width: "100%", height: "100%" },
            {
              opacity: viewTransition,
              transform: [
                {
                  translateX: viewTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={selectedView === "Map" ? "auto" : "none"}
        >
          <MapViewScreen
            key="map"
            navigation={navigation}
            filteredPlaces={filteredPlaces}
            selectedCategory={selectedCategory}
            selectedPlace={selectedPlace}
          />
        </Animated.View>
        <Animated.View
          style={[
            { flex: 1 },
            {
              opacity: viewTransition.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  translateX: viewTransition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={selectedView === "List" ? "auto" : "none"}
        >
          <ListViewScreen
            key="list"
            navigation={navigation}
            selectedCategory={selectedCategory}
            filteredPlaces={filteredPlaces}
            onItemPress={handleListItemPress}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerControls: {
    width: "100%",
    flexDirection: "column",
    gap: 10,
  },
  searchInput: {
    height: 50,
    fontSize: 16,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    fontFamily: "Fredoka",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 2,
  },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "600",
    color: "#ca92c1",
    fontFamily: "FredokaBold",
    lineHeight: 32,
    marginTop: 7,
  },
  logo: {
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
    resizeMode: "contain",
    marginTop: 5,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },
  selectedButton: {
    backgroundColor: "#000000",
  },
  toggleText: {
    color: "#000",
    fontFamily: "Fredoka",
  },
  selectedText: {
    color: "#fff",
    fontFamily: "Fredoka",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    fontFamily: "Fredoka",
  },
  categoryContainer: {
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
  },
  categoryContent: {
    paddingHorizontal: 0,
    paddingVertical: 5,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#dedede",
  },
  categoryText: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "FredokaSemibold",
  },
  selectedCategoryText: {
    color: "#fff",
  },
});

export default HomeScreen;
