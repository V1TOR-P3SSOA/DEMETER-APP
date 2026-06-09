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

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Paleta (cores originais do projeto) ─────────────────────────────────────
const ROSA        = "#D4476B";
const ROSAd        = "#e0849a";
const PRETO        = "#000000";
const ROSA_CLARO  = "#fce8ed";
const ROSA_BORDA  = "#e8b0be";
const ROSA_FUNDO  = "#fff0f3";
const TEXTO       = "#9a6070";
const BRANCO      = "#ffffff";
const VERMELHO    = "#c0394f";
const VERMELHO_BG = "#fdedef";

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Trunca o conteúdo em até 30 palavras e adiciona "...Leia mais" */
const truncarConteudo = (texto: string): { trecho: string; truncado: boolean } => {
  if (!texto) return { trecho: "", truncado: false };
  const palavras = texto.trim().split(/\s+/);
  if (palavras.length <= 30) return { trecho: texto, truncado: false };
  return { trecho: palavras.slice(0, 30).join(" "), truncado: true };
};

// ─── Tipagem ──────────────────────────────────────────────────────────────────
type Artigo = {
  id: number;
  titulo: string;
  conteudo: string;
  created_at: string;
  foto_url?: string;
};

// ─── Card individual ──────────────────────────────────────────────────────────
const ArtigoCard = ({
  item,
  onEdit,
  onDelete,
}: {
  item: Artigo;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { trecho, truncado } = truncarConteudo(item.conteudo);

  return (
    <View style={styles.card}>
      {/* ── Imagem de capa ── */}
      {item.foto_url ? (
        <View style={styles.cardImageWrapper}>
          <Image
            source={{ uri: item.foto_url }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {/* Overlay sutil */}
          <View style={styles.cardImageOverlay} />

          {/* Botão editar flutuante */}
          <TouchableOpacity
            style={styles.editFab}
            onPress={onEdit}
            activeOpacity={0.85}
          >
            <Text style={styles.editFabIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Sem foto: FAB de editar no canto do card */
        <TouchableOpacity
          style={styles.editFabNoImage}
          onPress={onEdit}
          activeOpacity={0.85}
        >
          <Text style={styles.editFabIcon}>✏️</Text>
        </TouchableOpacity>
      )}

      {/* ── Corpo ── */}
      <View style={styles.cardBody}>
        {/* Título */}
        <Text style={styles.cardTitulo} numberOfLines={2}>
          {item.titulo}
        </Text>

        {/* Prévia do conteúdo */}
        {trecho ? (
          <Text style={styles.cardConteudo}>
            {trecho}
            {truncado && (
              <Text style={styles.lerMais}>...Leia mais</Text>
            )}
          </Text>
        ) : null}

        {/* Rodapé: remover */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.btnRemover}
            onPress={onDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.btnRemoverText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── Estado vazio ─────────────────────────────────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📝</Text>
    <Text style={styles.emptyTitle}>Nenhum artigo ainda</Text>
    <Text style={styles.emptySubtitle}>
      Publique o primeiro artigo para inspirar suas leitoras.
    </Text>
  </View>
);

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function AdminArtigosScreen() {
  const router = useRouter();
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchArtigos(); }, []);

  const fetchArtigos = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/artigos`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setArtigos(json.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os artigos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Confirmar", "Deseja remover este artigo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("auth_token");
            const res = await fetch(`${API_URL}/api/admin/artigos/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setArtigos((prev) => prev.filter((a) => a.id !== id));
            Alert.alert("Sucesso", "Artigo removido.");
          } catch {
            Alert.alert("Erro", "Não foi possível remover o artigo.");
          }
        },
      },
    ]);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ROSA} />
        <Text style={styles.loadingText}>Carregando artigos…</Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />

      <FlatList
        data={artigos}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}

        // ── Cabeçalho ──────────────────────────────────────────────────────
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Título + logo */}
            <View style={styles.headerTop}>
              <Text style={styles.title}>Artigos{"\n"}cadastrados</Text>
              <Image
                source={require("../../assets/images/demeter.png")}
                style={{ width: 100, height: 100, marginLeft: 12, opacity: 0.9 }}
                resizeMode="contain"
              />
            </View>

            {/* Botão cadastrar */}
            <TouchableOpacity
              style={styles.btnNovo}
              activeOpacity={0.85}
              onPress={() => router.push("/admin/create_artigo" as any)}
            >
              <Text style={styles.btnNovoText}>+ Cadastrar novo artigo</Text>
            </TouchableOpacity>
          </View>
        }

        renderItem={({ item }) => (
          <ArtigoCard
            item={item}
            onEdit={() => router.push(`/admin/edit_artigo?id=${item.id}` as any)}
            onDelete={() => handleDelete(item.id)}
          />
        )}

        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const IMG_HEIGHT  = 195;
const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  // ── Tela ────────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: ROSA_CLARO,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ROSA_CLARO,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: TEXTO,
    fontWeight: "500",
  },

  // ── Lista ───────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // ── Cabeçalho ───────────────────────────────────────────────────────────────
  header: {
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    fontSize: 42,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    lineHeight: 40,
    flex: 1,
  },

  // ── Botão novo artigo ────────────────────────────────────────────────────────
  btnNovo: {
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
  btnNovoText: {
    color: BRANCO,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "serif",
    letterSpacing: 0.2,
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
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

  // Imagem
  cardImageWrapper: {
    width: "100%",
    height: IMG_HEIGHT,
  },
  cardImage: {
    width: "100%",
    height: IMG_HEIGHT,
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 20, 30, 0.10)",
  },

  // FAB editar (sobre imagem)
  editFab: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ROSA,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  // FAB editar (quando sem imagem)
  editFabNoImage: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ROSA,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editFabIcon: {
    fontSize: 15,
  },

  // Corpo
  cardBody: {
    padding: 16,
    paddingTop: 14,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,               // mesma cor do "Artigos cadastrados"
    lineHeight: 24,
    marginBottom: 8,
  },
  cardConteudo: {
    fontSize: 16,
    color: TEXTO,
    lineHeight: 24,
    marginBottom: 14,
  },
  lerMais: {
    color: PRETO,
    fontWeight: "600",
    fontSize: 16,
  },

  // Rodapé do card
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btnRemover: {
    backgroundColor: VERMELHO_BG,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btnRemoverText: {
    color: VERMELHO,
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Estado vazio ─────────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXTO,
    textAlign: "center",
    lineHeight: 20,
  },
});