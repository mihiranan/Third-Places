import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/Profile";
import NewPostScreen from "./screens/NewPost";
import { BlurView } from "expo-blur";
import store from "./store";
import { Provider } from "react-redux";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="NewPost" component={NewPostScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, size }) => {
          if (route.name === "Home") {
            return (
              <Ionicons
                name={"home"}
                size={focused ? size + 4 : size}
                color={focused ? "#000" : "#b0b0b0"}
                style={{ fontWeight: focused ? "900" : "400" }}
              />
            );
          } else if (route.name === "Add") {
            return (
              <FontAwesomeIcon
                icon={faCirclePlus}
                size={focused ? size + 12 : size + 8}
                color={focused ? "#000000" : "#b0b0b0"}
                style={{
                  marginBottom: -10,
                  marginTop: -10,
                }}
              />
            );
          } else if (route.name === "Profile") {
            return (
              <Ionicons
                name={"person"}
                size={focused ? size + 4 : size}
                color={focused ? "#000" : "#b0b0b0"}
                style={{ fontWeight: focused ? "900" : "400" }}
              />
            );
          }
        },
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={50}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 35,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          />
        ),
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "black",
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          left: 80,
          right: 80,
          elevation: 0,
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          borderRadius: 35,
          height: 65,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.7,
          shadowRadius: 4,
          marginLeft: 80,
          marginRight: 80,
          overflow: "hidden",
        },
        tabBarItemStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          paddingHorizontal: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Add" component={NewPostScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
