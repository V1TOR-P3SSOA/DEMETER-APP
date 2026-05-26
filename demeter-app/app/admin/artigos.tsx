import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Artigo = {
  id: number;
  titulo: string;
  created_at: string;
};

export default function AdminArtigosScreen() {
  const router = useRouter();
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchArtigos(); }, []);

  const fetchArtigos = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/artigos`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setArtigos(json.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os artigos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Confirmar", "Deseja remover este artigo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive", onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("auth_token");
            const res = await fetch(`${API_URL}/api/admin/artigos/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setArtigos((prev) => prev.filter((a) => a.id !== id));
            Alert.alert("Sucesso", "Artigo removido.");
          } catch {
            Alert.alert("Erro", "Não foi possível remover o artigo.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Artigos</Text>
      <FlatList
        data={artigos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitulo}>{item.titulo}</Text>
              <Text style={styles.cardData}>
                {new Date(item.created_at).toLocaleDateString("pt-BR")}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.btnEditar}
                onPress={() => router.push(`/admin/edit_artigo?id=${item.id}` as any)}
              >
                <Text style={styles.btnEditarText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDeletar}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.btnDeletarText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum artigo cadastrado.</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  card: {
    borderWidth: 1, borderColor: "#ccc",
    borderRadius: 8, padding: 14, marginBottom: 12,
  },
  cardInfo: { marginBottom: 10 },
  cardTitulo: { fontSize: 16, fontWeight: "600" },
  cardData: { fontSize: 12, color: "#888", marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 8 },
  btnEditar: {
    flex: 1, padding: 8, borderRadius: 6,
    backgroundColor: "#6b7c5c", alignItems: "center",
  },
  btnEditarText: { color: "#fff", fontWeight: "600" },
  btnDeletar: {
    flex: 1, padding: 8, borderRadius: 6,
    backgroundColor: "#b5405a", alignItems: "center",
  },
  btnDeletarText: { color: "#fff", fontWeight: "600" },
  vazio: { textAlign: "center", color: "#888", marginTop: 40 },
});