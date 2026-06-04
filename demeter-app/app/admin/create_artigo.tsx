import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import * as ImagePicker from "expo-image-picker";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SUPABASE_URL = "https://kfixoncmpzaeecxygabi.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = "artigos-imagens";

export default function CreateArtigoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permissão negada", "Precisamos de acesso à galeria."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [16, 9], quality: 0.8,
    });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const uploadFoto = async (uri: string): Promise<string> => {
    const filename = `artigo_${Date.now()}.jpg`;
    const formData = new FormData();
    formData.append("file", { uri, name: filename, type: "image/jpeg" } as any);
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "x-upsert": "true" },
      body: formData,
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
  };

  const handleSalvar = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert("Atenção", "Preencha título e conteúdo.");
      return;
    }

    setLoading(true);
    try {
      let foto_url: string | null = null;
      if (fotoUri) foto_url = await uploadFoto(fotoUri);

      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/admin/artigos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, conteudo, foto_url }),
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

      <TouchableOpacity style={styles.fotoBtn} onPress={pickImage}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
        ) : (
          <Text style={styles.fotoBtnText}>+ Adicionar foto</Text>
        )}
      </TouchableOpacity>

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
  fotoBtn: {
    width: "100%", height: 180, backgroundColor: "#f0f0f0", borderRadius: 12,
    borderWidth: 1, borderColor: "#ccc", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", marginBottom: 20, overflow: "hidden",
  },
  fotoPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  fotoBtnText: { fontSize: 16, fontWeight: "600", color: "#888" },
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