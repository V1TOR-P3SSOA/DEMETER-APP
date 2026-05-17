// app/home.tsx
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function HomeIcon() {
  return <Text style={styles.navIcon}>⌂</Text>;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets(); // pega as margens seguras do dispositivo

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />

      {/* Conteúdo principal vazio por enquanto */}
      <View style={styles.body} />

      {/* Navbar inferior */}
      <View style={[styles.navbar, { marginBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.navItem}>
          <HomeIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <HomeIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <HomeIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <HomeIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8d7da",
  },
  body: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    backgroundColor: "#f0ead8",
    marginHorizontal: 20,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: "#b5405a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: 24,
    color: "#6b7c5c",
  },
});