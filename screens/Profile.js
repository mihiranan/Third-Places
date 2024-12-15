import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Image,
} from "react-native";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
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

const Divider = ({ color = "#E0E0E0", thickness = 1, marginVertical = 10 }) => {
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: color, height: thickness, marginVertical },
      ]}
    />
  );
};

const ProfileScreen = () => {
  const savedPlaces = useSelector((state) => state.savedPlaces || []);
  const dispatch = useDispatch();
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [note, setNote] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBookmarkToggle = (place) => {
    const isSaved = savedPlaces.some(
      (savedPlace) => savedPlace.id === place.id
    );
    if (isSaved) {
      dispatch(unsavePlace(place));
    } else {
      dispatch(savePlace(place));
    }
  };

  const handleItemPress = (place) => {
    setSelectedPlace(place);
    setNote(place.note || "");
    setIsEditMode(false);
    setModalVisible(true);
  };

  const handleSaveNote = () => {
    const updatedPlace = { ...selectedPlace, note };
    dispatch(savePlace(updatedPlace));
    setIsEditMode(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleEditNote = () => {
    setIsEditMode(true);
  };

  const renderItem = ({ item }) => {
    const backgroundColor =
      CATEGORY_COLORS[item.category.toLowerCase()] || "#000000";

    const isSaved = savedPlaces.some((place) => place.id === item.id);

    return (
      <TouchableOpacity onPress={() => handleItemPress(item)}>
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

          <TouchableOpacity
            style={styles.likesContainer}
            onPress={() => handleBookmarkToggle(item)}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isSaved ? "#ffd700" : "#fff"}
            />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const categoryColor =
    CATEGORY_COLORS[selectedPlace?.category?.toLowerCase()] || "#000000";

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Profile"
        titleStyle={{ fontFamily: "Fredoka", fontSize: 24, color: "#000" }}
      />
      <View style={styles.header}>
        <Text style={[styles.headerText, styles.textBold]}>
          Your third places
        </Text>
      </View>
      <Divider color="black" thickness={1} marginVertical={15} />
      {savedPlaces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, styles.text]}>
            No bookmarked places yet!
          </Text>
          <Text style={[styles.emptySubText, styles.text]}>
            Start exploring! Bookmark your favorite places and add personalized
            notes here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedPlaces}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}

      {/* Modal for viewing/editing the note */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalView}>
          {isEditMode ? (
            <>
              {/* Edit Mode */}
              <Text style={[styles.modalText, { color: categoryColor }]}>
                Note:{" "}
                {selectedPlace?.name?.length > 20
                  ? selectedPlace.name.slice(0, 20) + "..."
                  : selectedPlace?.name}
              </Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={(text) => setNote(text.slice(0, 100))}
                placeholder="Add your note here"
                multiline={true}
                numberOfLines={4}
              />
              {/* <Button
                title="Done"
                onPress={handleSaveNote}
                color={categoryColor}
              /> */}
              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: categoryColor }]}
                onPress={handleSaveNote}
              >
                <Text style={[styles.doneButtonText, styles.textBold]}>
                  Done
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Viewing Mode */}
              <Text style={[styles.modalText, { color: categoryColor }]}>
                Note:{" "}
                {selectedPlace?.name?.length > 20
                  ? selectedPlace.name.slice(0, 20) + "..."
                  : selectedPlace?.name}
              </Text>
              <Text style={styles.noteText}>{note || "No note added"}</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Ionicons name="close" size={30} color={categoryColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditNote}>
                  <Ionicons name="create" size={30} color={categoryColor} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
  header: {
    marginTop: 70,
    marginLeft: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subHeaderText: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  list: {
    marginTop: 20,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
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
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: "100%",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center",
    alignSelf: "center",
    width: "90%",
    maxHeight: "70%",
    marginTop: "50%",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    fontFamily: "Fredoka",
  },
  noteText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    fontFamily: "Fredoka",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  input: {
    height: 100,
    borderColor: "#dedede",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    textAlignVertical: "top",
    marginBottom: 15,
    width: "100%",
    fontSize: 16,
    fontFamily: "Fredoka",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  doneButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Fredoka",
  },
});
