import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, StatusBar,
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
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ROSA} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />

      <Text style={styles.title}>Receitas{"\n"}cadastradas</Text>

      <TouchableOpacity
        style={styles.btnNovo}
        onPress={() => router.push("/admin/create_receita" as any)}
      >
        <Text style={styles.btnNovoText}>+ Cadastrar nova receita</Text>
      </TouchableOpacity>

      <FlatList
        data={receitas}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <View style={styles.tagsContainer}>
                {item.tipos_refeicoes?.split(",").map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagTexto}>{tag.trim()}</Text>
                  </View>
                ))}
                {item.tempo ? (
                  <View style={styles.tag}>
                    <Text style={styles.tagTexto}>{item.tempo}</Text>
                  </View>
                ) : null}
              </View>
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const ROSA        = "#b5405a";
const ROSA_CLARO  = "#fce8ed";
const ROSA_BORDA  = "#e8b0be";
const ROSA_TAG    = "#fce8ed";
const TEXTO       = "#9a6070";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO, paddingHorizontal: 20, paddingTop: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ROSA_CLARO },

  title: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    lineHeight: 38,
    marginBottom: 16,
  },

  btnNovo: {
    backgroundColor: ROSA,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  btnNovoText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  cardInfo: { padding: 14, paddingBottom: 10 },
  cardNome: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    lineHeight: 24,
    marginBottom: 10,
  },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: ROSA_TAG,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: ROSA_BORDA,
  },
  tagTexto: { fontSize: 12, color: ROSA, fontWeight: "500" },

  cardActions: { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 },
  btnEditar: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: ROSA_BORDA,
    alignItems: "center",
  },
  btnEditarText: { color: ROSA, fontWeight: "600", fontSize: 13 },
  btnDeletar: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: ROSA, alignItems: "center",
  },
  btnDeletarText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  vazio: { textAlign: "center", color: TEXTO, marginTop: 40, fontSize: 14 },
});