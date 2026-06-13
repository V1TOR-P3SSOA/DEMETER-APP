import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, StatusBar,
  Image, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Cores por categoria de tag (mesmo padrão da tela de receitas) ────────────
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
      <View style={styles.imageWrap}>
        {item.foto_url ? (
          <Image source={{ uri: item.foto_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🍽️</Text>
          </View>
        )}
        {/* Botão editar sobreposto no canto superior direito */}
        <TouchableOpacity style={styles.editOverlay} onPress={onEdit} activeOpacity={0.85}>
          <Text style={styles.editOverlayIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

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

        {/* Botão remover */}
        <TouchableOpacity style={styles.btnDeletar} onPress={onDelete} activeOpacity={0.85}>
          <Text style={styles.btnDeletarText}>Remover</Text>
        </TouchableOpacity>
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
      Alert.alert("Erro", "Não foi possível carregar as receitas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Confirmar", "Deseja remover esta receita?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive", onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("auth_token");
            const res = await fetch(`${API_URL}/api/admin/receitas/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setReceitas((prev) => prev.filter((r) => r.id !== id));
            Alert.alert("Sucesso", "Receita removida.");
          } catch {
            Alert.alert("Erro", "Não foi possível remover a receita.");
          }
        },
      },
    ]);
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

      <Text style={styles.title}>Receitas{"\n"}cadastradas</Text>

      <TouchableOpacity
        style={styles.btnNovo}
        onPress={() => router.push("/admin/create_receita" as any)}
      >
        <Text style={styles.btnNovoText}>+ Cadastrar nova receita</Text>
      </TouchableOpacity>

      <FlatList
        data={receitas}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ReceitaCard
            item={item}
            onEdit={() => router.push(`/admin/edit_receita?id=${item.id}` as any)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma receita cadastrada.</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      <AdminNavbar current="receitas" />
    </View>
  );
}

// ─── Cores ────────────────────────────────────────────────────────────────────
const ROSA       = "#b5405a";
const ROSA_CLARO = "#fce8ed";
const ROSA_BORDA = "#e8b0be";
const TEXTO      = "#9a6070";

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: ROSA_CLARO,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ROSA_CLARO,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: ROSA,
    lineHeight: 38,
    marginBottom: 16,
  },

  btnNovo: {
    backgroundColor: ROSA,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnNovoText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // ── Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Imagem
  imageWrap: { width: "100%", height: 180, position: "relative" },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#f8d7da",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: { fontSize: 52 },

  // Botão editar sobreposto
  editOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  editOverlayIcon: { fontSize: 16 },

  // Corpo do card
  cardBody: { padding: 14 },
  cardNome: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: ROSA,
    lineHeight: 26,
    marginBottom: 10,
  },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap" },

  // Botão remover
  btnDeletar: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: ROSA,
    alignItems: "center",
  },
  btnDeletarText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  vazio: { textAlign: "center", color: TEXTO, marginTop: 40, fontSize: 14 },
});