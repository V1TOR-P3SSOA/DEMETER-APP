import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,        // ← adicionado
  Image,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ROSA        = "#D4476B";
const ROSAd       = "#e0849a";
const PRETO       = "#000000";
const ROSA_CLARO  = "#fce8ed";
const ROSA_BORDA  = "#e8b0be";
const ROSA_FUNDO  = "#fff0f3";
const TEXTO       = "#9a6070";
const BRANCO      = "#ffffff";
const VERMELHO    = "#c0394f";
const VERMELHO_BG = "#fdedef";

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
  created_at: string;
  foto_url?: string;
};

// ─── Ícone de editar (stroke BRANCO para aparecer no fundo rosa) ──────────────
function IconEdit() {
  return (
    <Svg width={18} height={18} viewBox="0 0 16 16" fill="none">
      <Path
        d="M7.125 2.2526H2.16667C1.79094 2.2526 1.43061 2.40186 1.16493 2.66753C0.899255 2.93321 0.75 3.29355 0.75 3.66927V13.5859C0.75 13.9617 0.899255 14.322 1.16493 14.5877C1.43061 14.8533 1.79094 15.0026 2.16667 15.0026H12.0833C12.4591 15.0026 12.8194 14.8533 13.0851 14.5877C13.3507 14.322 13.5 13.9617 13.5 13.5859V8.6276M12.4375 1.1901C12.7193 0.908309 13.1015 0.75 13.5 0.75C13.8985 0.75 14.2807 0.908309 14.5625 1.1901C14.8443 1.47189 15.0026 1.85409 15.0026 2.2526C15.0026 2.65112 14.8443 3.03331 14.5625 3.3151L7.83333 10.0443L5 10.7526L5.70833 7.91927L12.4375 1.1901Z"
        stroke={BRANCO}        // ← era "#D4476B", agora branco
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Modal de confirmação customizado ────────────────────────────────────────
type ConfirmModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({ visible, onConfirm, onCancel }: ConfirmModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onCancel}
  >
    <View style={modalStyles.overlay}>
      <View style={modalStyles.box}>

        <Text style={modalStyles.title}>Remover artigo?</Text>
        <Text style={modalStyles.subtitle}>
          Esta ação não pode ser desfeita.{"\n"}O artigo será removido permanentemente.
        </Text>

        {/* Botões */}
        <View style={modalStyles.row}>
          <TouchableOpacity
            style={modalStyles.btnCancelar}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={modalStyles.btnCancelarText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={modalStyles.btnRemover}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={modalStyles.btnRemoverText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

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
      {item.foto_url ? (
        <View style={styles.cardImageWrapper}>
          <Image
            source={{ uri: item.foto_url }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardImageOverlay} />
          <TouchableOpacity style={styles.editFab} onPress={onEdit} activeOpacity={0.85}>
            <IconEdit />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editFabNoImage} onPress={onEdit} activeOpacity={0.85}>
          <IconEdit />
        </TouchableOpacity>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
        {trecho ? (
          <Text style={styles.cardConteudo}>
            {trecho}
            {truncado && <Text style={styles.lerMais}>...Leia mais</Text>}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.btnRemover} onPress={onDelete} activeOpacity={0.8}>
            <Text style={styles.btnRemoverText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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

  // Estado do modal de confirmação
  const [modalVisible, setModalVisible] = useState(false);
  const [artigoParaRemover, setArtigoParaRemover] = useState<number | null>(null);

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
      // trate o erro se quiser
    } finally {
      setLoading(false);
    }
  };

  // Abre o modal em vez do Alert nativo
  const handleDeletePress = (id: number) => {
    setArtigoParaRemover(id);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setModalVisible(false);
    if (artigoParaRemover === null) return;
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/admin/artigos/${artigoParaRemover}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setArtigos((prev) => prev.filter((a) => a.id !== artigoParaRemover));
    } catch {
      // trate o erro se quiser
    } finally {
      setArtigoParaRemover(null);
    }
  };

  const handleCancelDelete = () => {
    setModalVisible(false);
    setArtigoParaRemover(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ROSA} />
        <Text style={styles.loadingText}>Carregando artigos…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />

      {/* Modal de confirmação */}
      <ConfirmModal
        visible={modalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <FlatList
        data={artigos}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>Artigos{"\n"}cadastrados</Text>
              <Image
                source={require("../../assets/images/demeter.png")}
                style={{ width: 100, height: 100, marginLeft: 12, opacity: 0.9 }}
                resizeMode="contain"
              />
            </View>
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
            onDelete={() => handleDeletePress(item.id)}   // ← usa o novo handler
          />
        )}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
}

// ─── Estilos do modal ─────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(45, 20, 30, 0.50)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  box: {
    backgroundColor: ROSA_FUNDO,
    borderRadius: 24,
    padding: 28,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: VERMELHO_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: TEXTO,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  btnCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
    backgroundColor: BRANCO,
    alignItems: "center",
  },
  btnCancelarText: {
    color: TEXTO,
    fontSize: 14,
    fontWeight: "600",
  },
  btnRemover: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: VERMELHO,
    alignItems: "center",
  },
  btnRemoverText: {
    color: BRANCO,
    fontSize: 14,
    fontWeight: "700",
  },
});

// ─── Estilos gerais (iguais ao original) ─────────────────────────────────────
const IMG_HEIGHT  = 195;
const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ROSA_CLARO, gap: 12 },
  loadingText: { fontSize: 14, color: TEXTO, fontWeight: "500" },
  listContent: { paddingHorizontal: 20, paddingBottom: 48 },
  header: { paddingTop: 48, paddingBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 },
  title: { fontSize: 42, fontWeight: "700", fontFamily: "serif", color: ROSA, lineHeight: 40, flex: 1 },
  btnNovo: { backgroundColor: ROSAd, borderRadius: 14, paddingVertical: 15, alignItems: "center", shadowColor: ROSA, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  btnNovoText: { color: BRANCO, fontSize: 20, fontWeight: "700", fontFamily: "serif", letterSpacing: 0.2 },
  card: { backgroundColor: BRANCO, borderRadius: CARD_RADIUS, marginBottom: 18, overflow: "hidden", shadowColor: ROSA, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  cardImageWrapper: { width: "100%", height: IMG_HEIGHT },
  cardImage: { width: "100%", height: IMG_HEIGHT },
  cardImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(45, 20, 30, 0.10)" },
  editFab: { position: "absolute", top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: ROSA, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  editFabNoImage: { position: "absolute", top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: ROSA, alignItems: "center", justifyContent: "center", zIndex: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  cardBody: { padding: 16, paddingTop: 14 },
  cardTitulo: { fontSize: 20, fontWeight: "700", fontFamily: "serif", color: ROSA, lineHeight: 24, marginBottom: 8 },
  cardConteudo: { fontSize: 16, color: TEXTO, lineHeight: 24, marginBottom: 14 },
  lerMais: { color: PRETO, fontWeight: "600", fontSize: 16 },
  cardFooter: { flexDirection: "row", justifyContent: "flex-end" },
  btnRemover: { backgroundColor: VERMELHO_BG, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  btnRemoverText: { color: VERMELHO, fontSize: 13, fontWeight: "700" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: "700", fontFamily: "serif", color: ROSA, marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: TEXTO, textAlign: "center", lineHeight: 20 },
});