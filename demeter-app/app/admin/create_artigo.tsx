import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateArtigoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");

  const handleSalvar = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert("Atenção", "Preencha título e conteúdo.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/admin/artigos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, conteudo }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao salvar artigo.");
      }

      Alert.alert("Sucesso", "Artigo cadastrado com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Novo Artigo</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título do artigo"
      />

      <Text style={styles.label}>Conteúdo</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={conteudo}
        onChangeText={setConteudo}
        multiline
        placeholder="Conteúdo do artigo (será substituído pelo rich text editor)"
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.7 }]}
        onPress={handleSalvar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Salvar artigo</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: { height: 200, textAlignVertical: "top" },
  btn: {
    backgroundColor: "#6b7c5c",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});