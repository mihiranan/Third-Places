import React from "react";
import { Text, Platform, StatusBar, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

const Header = ({ title, titleStyle, children }) => (
  <BlurView intensity={60} tint="light" style={styles.headerContainer}>
    <View style={styles.headerContent}>
      <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
      {children}
    </View>
  </BlurView>
);

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: Platform.OS === "ios" ? 70 : StatusBar.currentHeight + 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});

export default Header;
