import { Tabs } from "expo-router";
import {
  FontAwesome,
  FontAwesome5,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#9DD187",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 10,
          height: 85,
        },
        tabBarActiveTintColor: "#2A2C38",
        tabBarInactiveTintColor: "#2A2C38",
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: -5,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
        headerStyle: {
          backgroundColor: "#9DD187",
        },
        headerTintColor: "#2A2C38",
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: "Publicar",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="add-to-list" color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservar"
        options={{
          title: "Reservar",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions-car" color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: "Cuenta",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-alt" color={color} size={25} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
