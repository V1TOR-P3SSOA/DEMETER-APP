import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user_role");
    router.replace("/login" as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>deu certoooooooooo</Text>

      <TouchableOpacity style={styles.btn} onPress={handleLogout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => router.push("/admin/create_receita" as any)}>
        <Text style={styles.btnText}>+ Nova Receita</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f0e8",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  text: {
    fontSize: 28,
    color: "#b5405a",
    fontWeight: "700",
  },
  btn: {
    backgroundColor: "#b5405a",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});