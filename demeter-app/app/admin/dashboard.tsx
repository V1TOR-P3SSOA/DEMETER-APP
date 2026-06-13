
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from "react-native";
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
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Painel Admin</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
        </View>
        <Text style={styles.bemVinda}>"Seja bem vinda(o)!"</Text>
        <View style={styles.grupo}>
          <TouchableOpacity style={styles.btnPrimario} onPress={() => router.push("/admin/create_receita" as any)}>
            <Text style={styles.btnPrimarioText}>+ Nova Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimario} onPress={() => router.push("/admin/create_artigo" as any)}>
            <Text style={styles.btnPrimarioText}>+ Novo Artigo</Text>
          </TouchableOpacity>

            <TouchableOpacity style={styles.btnPrimario} onPress={() => router.push("/admin/usuarios" as any)}>
            <Text style={styles.btnPrimarioText}>Usuarios</Text>
          </TouchableOpacity>
          
        </View>
        <View style={styles.grupo}>
          <TouchableOpacity style={styles.btnSecundario} onPress={() => router.push("/admin/receitas" as any)}>
            <Text style={styles.btnSecundarioText}>Gerenciar Receitas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecundario} onPress={() => router.push("/admin/artigos" as any)}>
            <Text style={styles.btnSecundarioText}>Gerenciar Artigos</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>Logout</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
}

const ROSA       = "#b5405a";
const ROSA_CLARO = "#fce8ed";
const ROSA_BORDA = "#e8b0be";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO },
  scroll: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 8 },
  headerSub: { fontSize: 13, color: ROSA, fontWeight: "500" },
  headerTitle: { fontSize: 28, fontWeight: "700", color: ROSA, fontFamily: "serif" },
  bemVinda: { fontSize: 16, color: ROSA, fontFamily: "serif", textAlign: "center", marginVertical: 24 },
  grupo: { flexDirection: "row", gap: 12, marginBottom: 12 },
  btnPrimario: {
    flex: 1,
    backgroundColor: ROSA,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  btnPrimarioText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  btnSecundario: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
  },
  btnSecundarioText: { color: ROSA, fontSize: 14, fontWeight: "600" },
  btnLogout: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
  },
  btnLogoutText: { color: ROSA, fontSize: 14, fontWeight: "600" },
});