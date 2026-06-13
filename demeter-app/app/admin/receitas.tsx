import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, StatusBar,
  Image, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path } from "react-native-svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Cores ────────────────────────────────────────────────────────────────────
const ROSA        = "#D4476B";
const ROSAd       = "#e0849a";
const ROSA_CLARO  = "#fce8ed";
const ROSA_BORDA  = "#e8b0be";
const ROSA_FUNDO  = "#fff0f3";
const TEXTO       = "#9a6070";
const BRANCO      = "#ffffff";
const VERMELHO    = "#c0394f";
const VERMELHO_BG = "#fdedef";

// ─── Cores por categoria de tag ───────────────────────────────────────────────
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  tempo:                  { bg: "#ffd6d6", text: "#a33030" },
  nutrientes_principais:  { bg: "#ffe4c4", text: "#a05a00" },
  sintomas_gestacao:      { bg: "#fffacd", text: "#8a7500" },
  restricoes_alimentares: { bg: "#d4f5d4", text: "#2e6b2e" },
  tipos_refeicoes:        { bg: "#cce8ff", text: "#1a5a8a" },
  tempo_preparo:          { bg: "#e8d4ff", text: "#6a2ea0" },
  objetivo_nutricional:   { bg: "#ffd9c0", text: "#a04020" },
};

type Receita = {
  id: number;
  nome: string;
  tipos_refeicoes: string;
  tempo: string;
  nutrientes_principais?: string;
  sintomas_gestacao?: string;
  restricoes_alimentares?: string;
  tempo_preparo?: string;
  objetivo_nutricional?: string;
  foto_url?: string;
};

// ─── Ícone de editar (stroke branco sobre fundo rosa) ────────────────────────
function IconEdit() {
  return (
    <Svg width={18} height={18} viewBox="0 0 16 16" fill="none">
      <Path
        d="M7.125 2.2526H2.16667C1.79094 2.2526 1.43061 2.40186 1.16493 2.66753C0.899255 2.93321 0.75 3.29355 0.75 3.66927V13.5859C0.75 13.9617 0.899255 14.322 1.16493 14.5877C1.43061 14.8533 1.79094 15.0026 2.16667 15.0026H12.0833C12.4591 15.0026 12.8194 14.8533 13.0851 14.5877C13.3507 14.322 13.5 13.9617 13.5 13.5859V8.6276M12.4375 1.1901C12.7193 0.908309 13.1015 0.75 13.5 0.75C13.8985 0.75 14.2807 0.908309 14.5625 1.1901C14.8443 1.47189 15.0026 1.85409 15.0026 2.2526C15.0026 2.65112 14.8443 3.03331 14.5625 3.3151L7.83333 10.0443L5 10.7526L5.70833 7.91927L12.4375 1.1901Z"
        stroke={BRANCO}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Tag colorida ─────────────────────────────────────────────────────────────
function Tag({ label, categoria }: { label: string; categoria: keyof typeof TAG_COLORS }) {
  const color = TAG_COLORS[categoria] ?? { bg: "#eee", text: "#555" };
  return (
    <View style={[tagStyle.wrap, { backgroundColor: color.bg }]}>
      <Text style={[tagStyle.text, { color: color.text }]}>{label}</Text>
    </View>
  );
}

const tagStyle = StyleSheet.create({
  wrap: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  text: { fontSize: 11, fontWeight: "600" },
});

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
        <Text style={modalStyles.title}>Remover receita?</Text>
        <Text style={modalStyles.subtitle}>
          Esta ação não pode ser desfeita.{"\n"}A receita será removida permanentemente.
        </Text>
        <View style={modalStyles.row}>
          <TouchableOpacity style={modalStyles.btnCancelar} onPress={onCancel} activeOpacity={0.8}>
            <Text style={modalStyles.btnCancelarText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.btnRemover} onPress={onConfirm} activeOpacity={0.8}>
            <Text style={modalStyles.btnRemoverText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

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
  iconEmoji: { fontSize: 24 },
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
  row: { flexDirection: "row", gap: 10, width: "100%" },
  btnCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
    backgroundColor: BRANCO,
    alignItems: "center",
  },
  btnCancelarText: { color: TEXTO, fontSize: 14, fontWeight: "600" },
  btnRemover: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: VERMELHO,
    alignItems: "center",
  },
  btnRemoverText: { color: BRANCO, fontSize: 14, fontWeight: "700" },
});

// ─── Card de receita ──────────────────────────────────────────────────────────
function ReceitaCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Receita;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      {/* Imagem com botão de editar sobreposto */}
      {item.foto_url ? (
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.foto_url }} style={styles.image} resizeMode="cover" />
          <View style={styles.imageOverlay} />
          <TouchableOpacity style={styles.editFab} onPress={onEdit} activeOpacity={0.85}>
            <IconEdit />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🍽️</Text>
          {/* FAB editar sem foto */}
          <TouchableOpacity style={styles.editFab} onPress={onEdit} activeOpacity={0.85}>
            <IconEdit />
          </TouchableOpacity>
        </View>
      )}

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardNome}>{item.nome}</Text>
        <View style={styles.tagsContainer}>
          {item.nutrientes_principais ? (
            <Tag label={item.nutrientes_principais} categoria="nutrientes_principais" />
          ) : null}
          {item.restricoes_alimentares ? (
            <Tag label={item.restricoes_alimentares} categoria="restricoes_alimentares" />
          ) : null}
          {item.tipos_refeicoes ? (
            <Tag label={item.tipos_refeicoes} categoria="tipos_refeicoes" />
          ) : null}
          {item.tempo_preparo ? (
            <Tag label={item.tempo_preparo} categoria="tempo_preparo" />
          ) : null}
          {item.sintomas_gestacao ? (
            <Tag label={item.sintomas_gestacao} categoria="sintomas_gestacao" />
          ) : null}
          {item.tempo ? (
            <Tag label={item.tempo} categoria="tempo" />
          ) : null}
          {item.objetivo_nutricional ? (
            <Tag label={item.objetivo_nutricional} categoria="objetivo_nutricional" />
          ) : null}
        </View>

        {/* Rodapé: remover (mesmo estilo dos artigos) */}
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.btnDeletar} onPress={onDelete} activeOpacity={0.8}>
            <Text style={styles.btnDeletarText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Navbar admin ─────────────────────────────────────────────────────────────
function AdminNavbar({ current }: { current: string }) {
  const router = useRouter();

  const items = [
    { key: "home",     label: "Início",   icon: "🏠", route: "/home" },
    { key: "receitas", label: "Receitas", icon: "🍽️", route: "/admin/receitas" },
    { key: "usuarios", label: "Usuários", icon: "👥", route: "/admin/usuarios" },
    { key: "artigos",  label: "Artigos",  icon: "📄", route: "/admin/artigos" },
    { key: "logout",   label: "Logout",   icon: "↪️", route: null },
  ];

  const handlePress = async (item: typeof items[0]) => {
    if (item.key === "logout") {
      await AsyncStorage.removeItem("auth_token");
      router.replace("/login" as any);
      return;
    }
    router.push(item.route as any);
  };

  return (
    <View style={nav.wrap}>
      {items.map((item) => {
        const active = item.key === current;
        return (
          <TouchableOpacity
            key={item.key}
            style={nav.item}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <View style={[nav.iconWrap, active && nav.iconWrapActive]}>
              <Text style={nav.icon}>{item.icon}</Text>
            </View>
            <Text style={[nav.label, active && nav.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const nav = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "#f5efe8",
    borderRadius: 30,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    shadowColor: "#b5405a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  item: { flex: 1, alignItems: "center", gap: 2 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  iconWrapActive: { backgroundColor: "#e8d4da" },
  icon: { fontSize: 18 },
  label: { fontSize: 10, color: "#9a7080", fontWeight: "500" },
  labelActive: { color: "#b5405a", fontWeight: "700" },
});

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function AdminReceitasScreen() {
  const router = useRouter();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [receitaParaRemover, setReceitaParaRemover] = useState<number | null>(null);

  useEffect(() => { fetchReceitas(); }, []);

  const fetchReceitas = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/receitas`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setReceitas(Array.isArray(json) ? json : json.data ?? []);
    } catch {
      // trate o erro se quiser
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePress = (id: number) => {
    setReceitaParaRemover(id);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setModalVisible(false);
    if (receitaParaRemover === null) return;
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/admin/receitas/${receitaParaRemover}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setReceitas((prev) => prev.filter((r) => r.id !== receitaParaRemover));
    } catch {
      // trate o erro se quiser
    } finally {
      setReceitaParaRemover(null);
    }
  };

  const handleCancelDelete = () => {
    setModalVisible(false);
    setReceitaParaRemover(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ROSA} />
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />

      {/* Modal de confirmação */}
      <ConfirmModal
        visible={modalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <FlatList
        data={receitas}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}

        ListHeaderComponent={
          <View style={styles.header}>
            {/* Título + logo Demeter (igual aos artigos) */}
            <View style={styles.headerTop}>
              <Text style={styles.title}>Receitas{"\n"}cadastradas</Text>
              <Image
                source={require("../../assets/images/demeter.png")}
                style={{ width: 100, height: 100, marginLeft: 12, opacity: 0.9 }}
                resizeMode="contain"
              />
            </View>

            {/* Botão cadastrar (mesma cor e estilo dos artigos) */}
            <TouchableOpacity
              style={styles.btnNovo}
              activeOpacity={0.85}
              onPress={() => router.push("/admin/create_receita" as any)}
            >
              <Text style={styles.btnNovoText}>+ Cadastrar nova receita</Text>
            </TouchableOpacity>
          </View>
        }

        renderItem={({ item }) => (
          <ReceitaCard
            item={item}
            onEdit={() => router.push(`/admin/edit_receita?id=${item.id}` as any)}
            onDelete={() => handleDeletePress(item.id)}
          />
        )}

        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma receita cadastrada.</Text>
        }
      />

      <AdminNavbar current="receitas" />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const IMG_HEIGHT  = 180;
const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: ROSA_CLARO,
    paddingTop: 0,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ROSA_CLARO,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // ── Cabeçalho (igual aos artigos) ──────────────────────────────────────────
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

  // ── Botão novo (igual aos artigos: ROSAd + serif) ──────────────────────────
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

  // ── Card ───────────────────────────────────────────────────────────────────
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
  imageWrap: { width: "100%", height: IMG_HEIGHT, position: "relative" },
  image: { width: "100%", height: IMG_HEIGHT },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 20, 30, 0.10)",
  },

  // Placeholder sem foto
  imagePlaceholder: {
    width: "100%",
    height: IMG_HEIGHT,
    backgroundColor: "#f8d7da",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  imagePlaceholderText: { fontSize: 52 },

  // FAB editar (rosa com ícone branco, mesmo dos artigos)
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

  // Corpo do card
  cardBody: { padding: 16, paddingTop: 14 },
  cardNome: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: ROSA,
    lineHeight: 26,
    marginBottom: 10,
  },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap" },

  // Rodapé remover (mesmo estilo dos artigos)
  cardFooter: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  btnDeletar: {
    backgroundColor: VERMELHO_BG,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btnDeletarText: { color: VERMELHO, fontSize: 13, fontWeight: "700" },

  vazio: { textAlign: "center", color: TEXTO, marginTop: 40, fontSize: 14 },
});