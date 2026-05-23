// app/receitas.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router"; // Importado para gerenciar a navegação

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Cores por categoria de tag ──────────────────────────────────────────────
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  tempo:                  { bg: "#ffd6d6", text: "#a33030" }, // vermelho pastel
  nutrientes_principais:  { bg: "#ffe4c4", text: "#a05a00" }, // laranja pastel
  sintomas_gestacao:      { bg: "#fffacd", text: "#8a7500" }, // amarelo pastel
  restricoes_alimentares: { bg: "#d4f5d4", text: "#2e6b2e" }, // verde pastel
  tipos_refeicoes:        { bg: "#cce8ff", text: "#1a5a8a" }, // azul pastel
  tempo_preparo:          { bg: "#e8d4ff", text: "#6a2ea0" }, // lilás pastel
  objetivo_nutricional:   { bg: "#ffd9c0", text: "#a04020" }, // pêssego pastel
};
// ─────────────────────────────────────────────────────────────────────────────

type Receita = {
  id: number;
  nome: string;
  tempo: string;
  nutrientes_principais: string;
  sintomas_gestacao: string;
  restricoes_alimentares: string;
  tipos_refeicoes: string;
  tempo_preparo: string;
  objetivo_nutricional: string;
  ingredientes: string;
  modo_preparo: string;
  foto_url?: string;
};

// Componente de tag colorida
function Tag({ label, categoria }: { label: string; categoria: keyof typeof TAG_COLORS }) {
  const color = TAG_COLORS[categoria] ?? { bg: "#eee", text: "#555" };
  return (
    <View style={[tagStyle.wrap, { backgroundColor: color.bg }]}>
      <Text style={[tagStyle.text, { color: color.text }]}>{label}</Text>
    </View>
  );
}

const tagStyle = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});

// Tags de uma receita
function ReceitaTags({ receita }: { receita: Receita }) {
  return (
    <View style={styles.tagsWrap}>
      <Tag label={receita.tempo} categoria="tempo" />
      <Tag label={receita.nutrientes_principais} categoria="nutrientes_principais" />
      <Tag label={receita.sintomas_gestacao} categoria="sintomas_gestacao" />
      <Tag label={receita.restricoes_alimentares} categoria="restricoes_alimentares" />
      <Tag label={receita.tipos_refeicoes} categoria="tipos_refeicoes" />
      <Tag label={receita.tempo_preparo} categoria="tempo_preparo" />
      <Tag label={receita.objetivo_nutricional} categoria="objetivo_nutricional" />
    </View>
  );
}

// Card de receita
function ReceitaCard({ receita, onPress }: { receita: Receita; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Foto */}
      <View style={styles.cardImageWrap}>
        {receita.foto_url ? (
          <Image source={{ uri: receita.foto_url }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImagePlaceholderText}>🍽️</Text>
          </View>
        )}
      </View>
      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardNome}>{receita.nome}</Text>
        <ReceitaTags receita={receita} />
      </View>
    </TouchableOpacity>
  );
}

// Modal de detalhes
function ReceitaModal({
  receita,
  visible,
  onClose,
}: {
  receita: Receita | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!receita) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Foto */}
            <View style={modal.imageWrap}>
              {receita.foto_url ? (
                <Image source={{ uri: receita.foto_url }} style={modal.image} resizeMode="cover" />
              ) : (
                <View style={modal.imagePlaceholder}>
                  <Text style={modal.imagePlaceholderText}>🍽️</Text>
                </View>
              )}
            </View>

            <View style={modal.content}>
              {/* Nome */}
              <Text style={modal.nome}>{receita.nome}</Text>

              {/* Tags */}
              <ReceitaTags receita={receita} />

              {/* Ingredientes */}
              <Text style={modal.sectionTitle}>🥗 Ingredientes</Text>
              <Text style={modal.sectionText}>{receita.ingredientes}</Text>

              {/* Modo de preparo */}
              <Text style={modal.sectionTitle}>👩‍🍳 Modo de preparo</Text>
              <Text style={modal.sectionText}>{receita.modo_preparo}</Text>
            </View>
          </ScrollView>

          {/* Botão fechar */}
          <TouchableOpacity style={modal.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={modal.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fdf6f0",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingBottom: 24,
  },
  imageWrap: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#f8d7da",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 56,
  },
  content: {
    padding: 20,
  },
  nome: {
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#b5405a",
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3a1a22",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#5a3a3a",
    lineHeight: 22,
  },
  closeBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: "#6b7c5c",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#f5f0e8",
    fontSize: 15,
    fontWeight: "700",
  },
});

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function ReceitasScreen() {
  const router = useRouter(); // Inicializado o roteador
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Receita | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchReceitas();
  }, []);

  const fetchReceitas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/receitas`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Erro ao carregar receitas.");
      const data = await response.json();
      setReceitas(Array.isArray(data) ? data : data.data ?? []);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (receita: Receita) => {
    setSelected(receita);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Receitas</Text>
        <Text style={styles.headerSub}>para a sua gestação 🌿</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#b5405a" style={{ marginTop: 40 }} />
      ) : receitas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma receita disponível ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={receitas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ReceitaCard receita={item} onPress={() => openModal(item)} />
          )}
        />
      )}

      {/* Navbar inferior inserida na tela de receitas */}
      <View style={styles.navbar}>
        {/* 1. Home (Redireciona de volta para a Home) */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push("/home" as any)}
        >
          <Text style={styles.navIcon}>⌂</Text>
        </TouchableOpacity>

        {/* 2. Receitas (Aba ativa atual) */}
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🍽️</Text>
        </TouchableOpacity>

        {/* 3. Placeholder */}
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⌂</Text>
        </TouchableOpacity>

        {/* 4. Placeholder */}
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⌂</Text>
        </TouchableOpacity>
      </View>

      <ReceitaModal receita={selected} visible={modalVisible} onClose={closeModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8d7da",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#b5405a",
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 14,
    color: "#a06070",
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 110, // Aumentado para os cards finais não ficarem por trás da navbar
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#a06070",
  },

  // Card
  card: {
    backgroundColor: "#fdf6f0",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e8c8d0",
    shadowColor: "#b5405a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageWrap: {
    width: "100%",
    height: 160,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: "#f8d7da",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImagePlaceholderText: {
    fontSize: 48,
  },
  cardBody: {
    padding: 14,
  },
  cardNome: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3a1a22",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  // Estilos da Navbar (Unificados do arquivo home)
  navbar: {
    position: "absolute", // Fixa a barra flutuando na parte inferior
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#f0ead8",
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: "#b5405a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: 24,
    color: "#6b7c5c",
  },
});