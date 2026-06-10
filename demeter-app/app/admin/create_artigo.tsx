import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Image, StatusBar,
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Cadastro{"\n"}de artigos</Text>

        <View style={styles.formCard}>

          <TouchableOpacity style={styles.fotoBtn} onPress={pickImage}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
            ) : (
              <>
                <Text style={styles.uploadIcon}>↑</Text>
                <Text style={styles.fotoBtnText}>Faça upload de uma foto</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Título:</Text>
          <TextInput
            style={styles.input}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ex: Quais as vitaminas primordiais na gravidez?"
            placeholderTextColor={ROSA_PLACEHOLDER}
          />

          <Text style={styles.label}>Texto:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            placeholder=""
            placeholderTextColor={ROSA_PLACEHOLDER}
            textAlignVertical="top"
          />

        </View>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleSalvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const ROSA             = "#b5405a";
const ROSA_CLARO       = "#fce8ed";
const ROSA_BORDA       = "#e8a0b0";
const ROSA_PLACEHOLDER = "#d4a0b0";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },

  backRow: { marginBottom: 4 },
  backIcon: { fontSize: 32, color: ROSA, fontWeight: "300", lineHeight: 36 },

  title: {
    fontSize: 34,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    lineHeight: 40,
    marginBottom: 24,
  },

  formCard: {
    backgroundColor: "#fff8f9",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  fotoBtn: {
    width: "100%",
    height: 160,
    backgroundColor: "#fff0f3",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  uploadIcon: { fontSize: 28, color: ROSA, marginBottom: 8 },
  fotoBtnText: { fontSize: 14, fontWeight: "600", color: ROSA },
  fotoPreview: { width: "100%", height: "100%", resizeMode: "cover" },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: ROSA,
    marginBottom: 6,
    marginTop: 4,
  },

  input: {
    backgroundColor: "#fff8f9",
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: ROSA,
    marginBottom: 12,
  },

  textArea: { height: 240, textAlignVertical: "top" },

  btn: {
    backgroundColor: ROSA,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "serif" },
});