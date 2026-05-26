import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Receita = {
  id: number;
  nome: string;
  tipos_refeicoes: string;
  tempo: string;
};

export default function AdminReceitasScreen() {
  const router = useRouter();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReceitas(); }, []);

  const fetchReceitas = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/receitas`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setReceitas(json.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as receitas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Confirmar", "Deseja remover esta receita?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive", onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("auth_token");
            const res = await fetch(`${API_URL}/api/admin/receitas/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setReceitas((prev) => prev.filter((r) => r.id !== id));
            Alert.alert("Sucesso", "Receita removida.");
          } catch {
            Alert.alert("Erro", "Não foi possível remover a receita.");
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
      <Text style={styles.title}>Receitas</Text>
      <FlatList
        data={receitas}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardSub}>{item.tipos_refeicoes} · {item.tempo}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.btnEditar}
                onPress={() => router.push(`/admin/edit_receita?id=${item.id}` as any)}
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
          <Text style={styles.vazio}>Nenhuma receita cadastrada.</Text>
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
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 14, marginBottom: 12,
  },
  cardInfo: { marginBottom: 10 },
  cardNome: { fontSize: 16, fontWeight: "600" },
  cardSub: { fontSize: 12, color: "#888", marginTop: 2 },
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