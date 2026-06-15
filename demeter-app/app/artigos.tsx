import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../components/Navbar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ROSA       = "#D4476B";
const ROSAd      = "#e0849a";
const ROSA_CLARO = "#fce8ed";
const TEXTO      = "#9a6070";
const BRANCO     = "#ffffff";

const truncarConteudo = (texto: string): { trecho: string; truncado: boolean } => {
  if (!texto) return { trecho: "", truncado: false };
  const palavras = texto.trim().split(/\s+/);
  if (palavras.length <= 30) return { trecho: texto, truncado: false };
  return { trecho: palavras.slice(0, 30).join(" "), truncado: true };
};

type Artigo = {
  id: number;
  titulo: string;
  conteudo: string;
  foto_url: string | null;
  created_at: string;
};

const ArtigoCard = ({ item, onPress }: { item: Artigo; onPress: () => void }) => {
  const { trecho, truncado } = truncarConteudo(item.conteudo);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {item.foto_url ? (
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: item.foto_url }} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.cardImageOverlay} />
        </View>
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
        {trecho ? (
          <Text style={styles.cardConteudo}>
            {trecho}
            {truncado && <Text style={styles.lerMais}>...Leia mais</Text>}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📝</Text>
    <Text style={styles.emptyTitle}>Nenhum artigo ainda</Text>
    <Text style={styles.emptySubtitle}>Em breve novos conteúdos para você!</Text>
  </View>
);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />

      {/* Loading sobreposto — navbar continua visível */}
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={ROSA} />
          <Text style={styles.loadingText}>Carregando artigos…</Text>
        </View>
      ) : (
        <FlatList
          data={artigos}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}

          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.title}>Artigos</Text>
                <Image
                  source={require("../assets/images/demeter.png")}
                  style={{ width: 100, height: 100, opacity: 0.9 }} 
                  resizeMode="contain"
                />
              </View>
            </View>
          }

          renderItem={({ item }) => (
            <ArtigoCard
              item={item}
              onPress={() => router.push(`/artigo/${item.id}` as any)}
            />
          )}

          ListEmptyComponent={<EmptyState />}
        />
      )}

      {/* Navbar sempre visível */}
      <Navbar current="artigos" />
    </View>
  );
}

const IMG_HEIGHT  = 195;
const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO },

  // Loading sobreposto — não esconde a navbar
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, color: TEXTO, fontWeight: "500" },

  listContent: { paddingHorizontal: 20, paddingBottom: 110 },

  // Header com título descido
  header: { paddingTop: 64, paddingBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
 title: {
  fontSize: 42, 
  fontWeight: "700",
  fontFamily: "serif",
  color: ROSA,
  lineHeight: 46,
  flex: 1,
},

  card: {
    backgroundColor: BRANCO,
    borderRadius: CARD_RADIUS,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImageWrapper: { width: "100%", height: IMG_HEIGHT },
  cardImage: { width: "100%", height: IMG_HEIGHT },
  cardImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(45, 20, 30, 0.10)" },
  cardBody: { padding: 16, paddingTop: 14 },
  cardTitulo: { fontSize: 22, fontWeight: "700", fontFamily: "serif", color: ROSA, lineHeight: 26, marginBottom: 8 },
  cardConteudo: { fontSize: 18, color: TEXTO, lineHeight: 22, marginBottom: 4 },
  lerMais: { color: ROSA, fontWeight: "600", fontSize: 18 },

  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: "700", fontFamily: "serif", color: ROSA, marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: TEXTO, textAlign: "center", lineHeight: 20 },
});