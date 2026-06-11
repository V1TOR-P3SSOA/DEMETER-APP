import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Image, StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import * as ImagePicker from "expo-image-picker";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SUPABASE_URL = "https://kfixoncmpzaeecxygabi.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = "artigos-imagens";

export default function EditArtigoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoUrlAtual, setFotoUrlAtual] = useState<string | null>(null);

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
      setFotoUrlAtual(json.data.foto_url ?? null);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o artigo.");
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);
    try {
      let foto_url = fotoUrlAtual;
      if (fotoUri) foto_url = await uploadFoto(fotoUri);
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/admin/artigos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, conteudo, foto_url }),
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
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ROSA} />
      </View>
    );
  }

  const fotoExibida = fotoUri ?? fotoUrlAtual;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Cabeçalho: seta + logo ── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/demeter.png")}
            style={{ width: 100, height: 100, opacity: 0.9 }}
            resizeMode="contain"
          />
        </View>

        {/* ── Título centralizado ── */}
        <Text style={styles.title}>Editar{"\n"}artigo</Text>

        <View style={styles.formCard}>

          <TouchableOpacity style={styles.fotoBtn} onPress={pickImage}>
            {fotoExibida ? (
              <>
                <Image source={{ uri: fotoExibida }} style={styles.fotoPreview} />
                <View style={styles.fotoOverlay}>
                  <Text style={styles.uploadIcon}>↑</Text>
                  <Text style={styles.fotoBtnTextOverlay}>Faça upload de uma foto</Text>
                </View>
              </>
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
            placeholderTextColor={ROSA_PLACEHOLDER}
          />

          <Text style={styles.label}>Texto:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            textAlignVertical="top"
            placeholderTextColor={ROSA_PLACEHOLDER}
          />

        </View>

        <TouchableOpacity
          style={[styles.btn, saving && { opacity: 0.7 }]}
          onPress={handleSalvar}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Atualizar</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const ROSA             = "#D4476B";
const ROSAd            = "#e0849a";
const ROSA_CLARO       = "#fce8ed";
const ROSA_BORDA       = "#e8a0b0";
const ROSA_PLACEHOLDER = "#d4a0b0";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ROSA_CLARO },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },

  // ── Cabeçalho ─────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    marginBottom: 0,
  },
  backBtn: {
    padding: 8,
  },
  backIcon: {
    fontSize: 52,
    color: ROSA,
    fontWeight: "300",
    lineHeight: 56,
  },

  // ── Título centralizado ────────────────────────────────────────────────────
  title: {
    fontSize: 34,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    lineHeight: 40,
    textAlign: "center",
    marginTop: -70,
    marginBottom: 14,
  },

  // ── Formulário ─────────────────────────────────────────────────────────────
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
  fotoPreview: { width: "100%", height: "100%", resizeMode: "cover", position: "absolute" },
  fotoOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,240,243,0.6)",
    width: "100%",
    height: "100%",
  },
  uploadIcon: { fontSize: 28, color: ROSA, marginBottom: 8 },
  fotoBtnText: { fontSize: 14, fontWeight: "600", color: ROSA },
  fotoBtnTextOverlay: { fontSize: 14, fontWeight: "600", color: ROSA },

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

  textArea: { height: 280, textAlignVertical: "top" },

  // ── Botão atualizar (mesma cor do "Novo artigo") ───────────────────────────
  btn: {
    backgroundColor: ROSAd,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "serif",
    letterSpacing: 0.2,
  },
});