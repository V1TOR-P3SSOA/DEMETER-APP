import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Artigo = {
  id: number;
  titulo: string;
  conteudo: string;
  foto_url: string | null;
  created_at: string;
};

export default function ArtigosScreen() {
  const router = useRouter();
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchArtigos(); }, []);

  const fetchArtigos = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/artigos`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao carregar artigos.");
      const json = await response.json();
      setArtigos(json.data);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/artigo/${item.id}` as any)}
          >
            {item.foto_url && (
              <Image source={{ uri: item.foto_url }} style={styles.cardImagem} />
            )}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitulo}>{item.titulo}</Text>
              <Text style={styles.cardTrecho} numberOfLines={2}>
                {item.conteudo}
              </Text>
              <Text style={styles.cardData}>
                {new Date(item.created_at).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum artigo cadastrado ainda.</Text>
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
    borderRadius: 12, marginBottom: 16, overflow: "hidden",
  },
  cardImagem: { width: "100%", height: 160, resizeMode: "cover" },
  cardBody: { padding: 14 },
  cardTitulo: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  cardTrecho: { fontSize: 13, color: "#555", lineHeight: 18, marginBottom: 6 },
  cardData: { fontSize: 11, color: "#888" },
  vazio: { textAlign: "center", color: "#888", marginTop: 40 },
});