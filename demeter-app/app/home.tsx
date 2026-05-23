// app/home.tsx
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />

      {/* Conteúdo principal — a ser preenchido */}
      <View style={styles.body} />

      {/* Navbar inferior */}
      <View style={styles.navbar}>
        {/* 1. Home */}
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⌂</Text>
        </TouchableOpacity>

        {/* 2. Receitas */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/receitas" as any)}
        >
          <Text style={styles.navIcon}>🍽️</Text>
        </TouchableOpacity>

        {/* 3. Placeholder */}
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⌂</Text>
        </TouchableOpacity>

        {/* 4. Placeholder */}
<TouchableOpacity
  style={styles.navItem}
  onPress={() => router.push("/maeinfo" as any)}
>
  <Text style={styles.navIcon}>👤</Text>
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
    marginBottom: 24,
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