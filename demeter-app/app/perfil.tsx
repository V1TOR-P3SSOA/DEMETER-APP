// app/perfil.tsx
import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import Navbar from "../components/Navbar";

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />

      {/* Conteúdo — a ser preenchido */}
      <View style={styles.body} />

      <Navbar current="gravida" />
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
});