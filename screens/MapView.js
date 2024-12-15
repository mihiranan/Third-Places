import "react-native-gesture-handler";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from "react-native-maps";
import { supabase } from "../supabase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Platform, StatusBar, Dimensions } from "react-native";

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

const getCategoryColor = (category) => {
  if (!category) return "#000000";
  const normalizedCategory = category.toLowerCase();
  return CATEGORY_COLORS[normalizedCategory] || "#000000";
};

const CustomMarker = ({ category }) => {
  return (
    <View
      style={[
        styles.markerContainer,
        {
          backgroundColor: getCategoryColor(category),
        },
      ]}
    >
      <Icon
        name={CATEGORY_ICONS[category?.toLowerCase()] || "help-circle"}
        size={20}
        color="white"
      />
    </View>
  );
};

const MapViewScreen = ({
  navigation,
  selectedCategory,
  selectedPlace: initialSelectedPlace,
  filteredPlaces: searchResults,
}) => {
  const [places, setPlaces] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState({});
  const [likedPlaces, setLikedPlaces] = useState({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const mapRef = useRef(null);
  const [markerRef, setMarkerRef] = useState({});
  const [hasMapMoved, setHasMapMoved] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [markerFadeAnim] = useState(new Animated.Value(0));
  const [markerAnimation] = useState(new Animated.Value(1));

  const OVERVIEW_ZOOM = 0.0671;

  const STANFORD_REGION = {
    latitude: 37.4405,
    longitude: -122.1697,
    latitudeDelta: OVERVIEW_ZOOM,
    longitudeDelta: OVERVIEW_ZOOM * 0.5,
  };

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const CALLOUT_HEIGHT = 180;
  const STATUS_BAR_HEIGHT =
    Platform.OS === "ios" ? 44 : StatusBar.currentHeight;
  const TOP_PADDING = 50;

  const fetchPlaces = async () => {
    try {
      const { data, error } = await supabase.from("Places").select("*");
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

  useEffect(() => {
    fetchPlaces();
    const interval = setInterval(fetchPlaces, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPlaces();
    const interval =
      selectedCategory === "all" ? setInterval(fetchPlaces, 30000) : null;
    const unsubscribe = navigation.addListener("focus", () => {
      fetchPlaces();
    });

    return () => {
      if (interval) clearInterval(interval);
      unsubscribe();
    };
  }, [navigation, selectedCategory]);

  useEffect(() => {
    return () => {
      setPlaces([]);
      setLikedPlaces({});
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const animateMarkers = async () => {
      await new Promise((resolve) => {
        Animated.timing(markerAnimation, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }).start(resolve);
      });

      if (isMounted) {
        Animated.spring(markerAnimation, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }
    };

    animateMarkers();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  useEffect(() => {
    if (initialSelectedPlace) {
      setSelectedPlace(initialSelectedPlace);
      handleMarkerPress(initialSelectedPlace);
    }
  }, [initialSelectedPlace]);

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

  const handleMarkerPress = useCallback((marker) => {
    const { latitude, longitude } = marker;
    setIsZoomedIn(true);

    const region = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    mapRef.current?.animateToRegion(region, 1000);

    setTimeout(() => {
      if (marker.id && markerRef[marker.id]) {
        markerRef[marker.id].showCallout();
      }
    }, 1000);
  }, []);

  const memoizedMapView = useMemo(() => {
    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        showsUserLocation={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        initialRegion={STANFORD_REGION}
        onRegionChangeComplete={(region) => {
          setHasMapMoved(hasRegionChanged(region, STANFORD_REGION));
        }}
      >
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            ref={(ref) => {
              markerRef[place.id] = ref;
            }}
            onPress={() => {
              setSelectedPlace(place);
              handleMarkerPress(place);
            }}
          >
            <Animated.View
              style={{
                opacity: markerAnimation,
                transform: [{ scale: markerAnimation }],
              }}
            >
              <CustomMarker category={place.category} />
            </Animated.View>
            <Callout tooltip visible={selectedPlace?.id === place.id}>
              <View
                style={[
                  styles.calloutContainer,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[place.category.toLowerCase()] ||
                      "#000000",
                  },
                ]}
              >
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{place.name}</Text>
                  {place.description && (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {place.description}
                    </Text>
                  )}
                  <Text style={styles.itemTimestamp}>
                    {new Date(place.created_at).toLocaleString()}
                  </Text>
                </View>
                {/* <View style={styles.likesContainer}>
                  <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.likeButton}
                    onPress={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLike(place.id);
                    }}
                  >
                    <Ionicons
                      name={likedPlaces[place.id] ? "heart" : "heart-outline"}
                      size={24}
                      color={likedPlaces[place.id] ? "#ff0000" : "#fff"}
                    />
                  </TouchableOpacity>
                  <Text style={styles.likeCount}>{place.likes || 0}</Text>
                </View> */}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    );
  }, [filteredPlaces, handleMarkerPress, selectedPlace, initialSelectedPlace]);

  const handleReturnToOverview = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(markerFadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsZoomedIn(false);
      setHasMapMoved(false);
      if (selectedPlace) {
        markerRef[selectedPlace.id]?.hideCallout();
      }
      setSelectedPlace(null);
      mapRef.current?.animateToRegion(STANFORD_REGION, 1000);
    });
  };

  const hasRegionChanged = (region1, region2) => {
    const latDiff = Math.abs(region1.latitude - region2.latitude);
    const lonDiff = Math.abs(region1.longitude - region2.longitude);
    const threshold = 0.01;
    return latDiff > threshold || lonDiff > threshold;
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: hasMapMoved ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [hasMapMoved]);

  useEffect(() => {
    Animated.timing(markerFadeAnim, {
      toValue: isZoomedIn ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isZoomedIn]);

  return (
    <View style={styles.container}>
      {memoizedMapView}
      {isZoomedIn ? (
        <Animated.View
          style={[styles.returnButtonContainer, { opacity: markerFadeAnim }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={styles.returnButton}
            onPress={handleReturnToOverview}
          >
            <Text style={styles.returnButtonText}>Return to overview</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View
          style={[styles.returnButtonContainer, { opacity: fadeAnim }]}
          pointerEvents={hasMapMoved ? "auto" : "none"}
        >
          <TouchableOpacity
            style={styles.returnButton}
            onPress={handleReturnToOverview}
          >
            <Text style={styles.returnButtonText}>Reset map</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    padding: 16,
    borderRadius: 20,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  fab: {
    position: "absolute",
    bottom: 110,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    zIndex: 1,
  },
  likesContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  likeButton: {
    marginRight: 6,
  },
  likeCount: {
    fontSize: 14,
    color: "#ffffff",
  },
  returnButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  returnButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  returnButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default MapViewScreen;
