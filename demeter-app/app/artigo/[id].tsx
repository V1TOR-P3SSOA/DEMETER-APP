import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get("window");

// ─── Paleta ───────────────────────────────────────────────────────────────────
const ROSA       = "#D4476B";
const ROSA_CLARO = "#fce8ed";
const TEXTO      = "#4a3040";
const BRANCO     = "#ffffff";

// ─── Tipagem ──────────────────────────────────────────────────────────────────
type Artigo = {
  id: number;
  titulo: string;
  conteudo: string;
  foto_url: string | null;
  created_at: string;
};

// ─── Tela de detalhe ──────────────────────────────────────────────────────────
export default function ArtigoDetalheScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [artigo, setArtigo] = useState<Artigo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchArtigo(); }, []);

  const fetchArtigo = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/artigos/${id}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setArtigo(json.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o artigo.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ROSA} />
      </View>
    );
  }

  if (!artigo) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Foto de capa ── */}
        {artigo.foto_url ? (
          <View style={styles.fotoWrapper}>
            <Image
              source={{ uri: artigo.foto_url }}
              style={styles.foto}
              resizeMode="cover"
            />
            {/* Overlay gradiente */}
            <View style={styles.fotoOverlay} />

            {/* Botão fechar sobre a foto */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Sem foto: header simples */
          <View style={styles.headerSemFoto}>
            <TouchableOpacity
              style={styles.closeBtnSemFoto}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Text style={styles.closeBtnSemFotoText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Conteúdo ── */}
        <View style={styles.conteudoCard}>
          <Text style={styles.titulo}>{artigo.titulo}</Text>
          <Text style={styles.conteudo}>{artigo.conteudo}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const FOTO_HEIGHT = 280;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ROSA_CLARO },
  scrollContent: { paddingBottom: 48 },

  // ── Foto ────────────────────────────────────────────────────────────────────
  fotoWrapper: {
    width: "100%",
    height: FOTO_HEIGHT,
  },
  foto: {
    width: "100%",
    height: FOTO_HEIGHT,
  },
  fotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30, 10, 20, 0.25)",
  },

  // Botão fechar sobre a foto
  closeBtn: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: ROSA,
    fontWeight: "700",
    lineHeight: 18,
  },

  // Header sem foto
  headerSemFoto: {
    height: 80,
    backgroundColor: ROSA_CLARO,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeBtnSemFoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRANCO,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closeBtnSemFotoText: {
    fontSize: 16,
    color: ROSA,
    fontWeight: "700",
    lineHeight: 18,
  },

  // ── Conteúdo ────────────────────────────────────────────────────────────────
  conteudoCard: {
    backgroundColor: BRANCO,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    minHeight: 400,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    lineHeight: 34,
    marginBottom: 18,
  },
  conteudo: {
    fontSize: 20,
    color: TEXTO,
    lineHeight: 26,
    textAlign: "justify",
  },
});