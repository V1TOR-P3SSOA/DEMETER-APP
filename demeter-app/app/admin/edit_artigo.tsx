import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditArtigoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");

  useEffect(() => { fetchArtigo(); }, []);

  const fetchArtigo = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/artigos/${id}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setTitulo(json.data.titulo);
      setConteudo(json.data.conteudo);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o artigo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert("Atenção", "Preencha título e conteúdo.");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/admin/artigos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, conteudo }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      Alert.alert("Sucesso", "Artigo atualizado!", [
        { text: "OK", onPress: () => router.replace("/admin/artigos" as any) },
      ]);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Editar Artigo</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Conteúdo</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={conteudo}
        onChangeText={setConteudo}
        multiline
      />

      <TouchableOpacity
        style={[styles.btn, saving && { opacity: 0.7 }]}
        onPress={handleSalvar}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Salvar alterações</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
  },
  textArea: { height: 200, textAlignVertical: "top" },
  btn: {
    backgroundColor: "#6b7c5c", borderRadius: 10,
    paddingVertical: 16, alignItems: "center", marginTop: 24,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});