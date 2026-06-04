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
  TextInput,
} from "react-native";
import Navbar from "../components/Navbar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Enums para os filtros ───────────────────────────────────────────────────
const FILTROS: Record<string, string[]> = {
  tempo:                  ["semana 1-4","semana 5-8","semana 9-12","segundo trimestre","terceiro trimestre","pré parto"],
  nutrientes_principais:  ["rico em ferro","rico em cálcio","rico em dha","rico em proteínas","rico em fibras","rico em ácido fólico","rico em vitamina c","rico em magnésio","rico em potássio","rico em colina"],
  sintomas_gestacao:      ["para enjoo","para azia","para constipação","para fadiga","para inchaço","para anemia","para falta de apetite","para desejos alimentares","energia rápida"],
  restricoes_alimentares: ["vegetariana","vegana","sem lactose","sem glúten","baixo açúcar","sem frutos do mar","sem oleaginosas","diabéticas"],
  tipos_refeicoes:        ["café da manhã","lanche","almoço","jantar","sobremesa saudável","ceia","smoothie","marmita","refeição rápida"],
  tempo_preparo:          ["até 10 min","até 20 min","até 40 min","prática","uma panela só"],
  objetivo_nutricional:   ["ganho de peso saudável","controle glicêmico","aumento de ferro","saúde intestinal","desenvolvimento cerebral do bebê","fortalecimento ósseo","hidratação","imunidade"],
};

const FILTROS_LABELS: Record<string, string> = {
  tempo:                  "Período",
  nutrientes_principais:  "Nutriente",
  sintomas_gestacao:      "Sintoma",
  restricoes_alimentares: "Restrição",
  tipos_refeicoes:        "Refeição",
  tempo_preparo:          "Preparo",
  objetivo_nutricional:   "Objetivo",
};

// ─── Cores por categoria de tag ──────────────────────────────────────────────
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

// ─── Componentes Tag, ReceitaTags, ReceitaCard, ReceitaModal (inalterados) ───
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

function ReceitaCard({ receita, onPress }: { receita: Receita; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImageWrap}>
        {receita.foto_url ? (
          <Image source={{ uri: receita.foto_url }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImagePlaceholderText}>🍽️</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardNome}>{receita.nome}</Text>
        <ReceitaTags receita={receita} />
      </View>
    </TouchableOpacity>
  );
}

function ReceitaModal({ receita, visible, onClose }: { receita: Receita | null; visible: boolean; onClose: () => void }) {
  if (!receita) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
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
              <Text style={modal.nome}>{receita.nome}</Text>
              <ReceitaTags receita={receita} />
              <Text style={modal.sectionTitle}>🥗 Ingredientes</Text>
              <Text style={modal.sectionText}>{receita.ingredientes}</Text>
              <Text style={modal.sectionTitle}>👩‍🍳 Modo de preparo</Text>
              <Text style={modal.sectionText}>{receita.modo_preparo}</Text>
            </View>
          </ScrollView>
          <TouchableOpacity style={modal.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={modal.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000055", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fdf6f0", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%", paddingBottom: 24 },
  imageWrap: { width: "100%", height: 220, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, backgroundColor: "#f8d7da", alignItems: "center", justifyContent: "center" },
  imagePlaceholderText: { fontSize: 56 },
  content: { padding: 20 },
  nome: { fontSize: 24, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", color: "#b5405a", fontWeight: "700", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#3a1a22", marginTop: 20, marginBottom: 8 },
  sectionText: { fontSize: 14, color: "#5a3a3a", lineHeight: 22 },
  closeBtn: { marginHorizontal: 20, marginTop: 8, backgroundColor: "#6b7c5c", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  closeBtnText: { color: "#f5f0e8", fontSize: 15, fontWeight: "700" },
});

// ─── Modal de filtros ────────────────────────────────────────────────────────
function FiltrosModal({
  visible,
  filtrosAtivos,
  onAplicar,
  onFechar,
}: {
  visible: boolean;
  filtrosAtivos: Record<string, string>;
  onAplicar: (filtros: Record<string, string>) => void;
  onFechar: () => void;
}) {
  const [selecionados, setSelecionados] = useState<Record<string, string>>(filtrosAtivos);

  useEffect(() => { setSelecionados(filtrosAtivos); }, [visible]);

  const toggle = (campo: string, valor: string) => {
    setSelecionados((prev) => ({
      ...prev,
      [campo]: prev[campo] === valor ? "" : valor,
    }));
  };

  const limpar = () => setSelecionados({});

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onFechar}>
      <View style={fm.overlay}>
        <View style={fm.sheet}>
          <View style={fm.header}>
            <Text style={fm.titulo}>Filtros</Text>
            <TouchableOpacity onPress={limpar}>
              <Text style={fm.limpar}>Limpar tudo</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {Object.entries(FILTROS).map(([campo, opcoes]) => (
              <View key={campo} style={fm.grupo}>
                <Text style={fm.grupoLabel}>{FILTROS_LABELS[campo]}</Text>
                <View style={fm.chips}>
                  {opcoes.map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[fm.chip, selecionados[campo] === op && fm.chipAtivo]}
                      onPress={() => toggle(campo, op)}
                    >
                      <Text style={[fm.chipText, selecionados[campo] === op && fm.chipTextAtivo]}>
                        {op}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={fm.footer}>
            <TouchableOpacity style={fm.btnAplicar} onPress={() => onAplicar(selecionados)}>
              <Text style={fm.btnAplicarText}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const fm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000055", justifyContent: "flex-end" },
  sheet: { 
  backgroundColor: "#fdf6f0", 
  borderTopLeftRadius: 28, 
  borderTopRightRadius: 28, 
  height: "90%",  // <- mude maxHeight para height
  paddingBottom: 24 
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#e8c8d0" },
  titulo: { fontSize: 20, fontWeight: "700", color: "#b5405a" },
  limpar: { fontSize: 13, color: "#6b7c5c", fontWeight: "600" },
  grupo: { paddingHorizontal: 20, paddingTop: 16 },
  grupoLabel: { fontSize: 13, fontWeight: "700", color: "#3a1a22", marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "#f0ead8", borderWidth: 1, borderColor: "#d4a0aa" },
  chipAtivo: { backgroundColor: "#b5405a", borderColor: "#b5405a" },
  chipText: { fontSize: 12, color: "#3a1a22" },
  chipTextAtivo: { color: "#fff", fontWeight: "600" },
  footer: { paddingHorizontal: 20, paddingTop: 16 },
  btnAplicar: { backgroundColor: "#6b7c5c", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnAplicarText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

// ─── Tela principal ──────────────────────────────────────────────────────────
export default function ReceitasScreen() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Receita | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [filtrosAtivos, setFiltrosAtivos] = useState<Record<string, string>>({});

  useEffect(() => { fetchReceitas(); }, []);

  const fetchReceitas = async (params: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      const url = `${API_URL}/api/receitas${query ? `?${query}` : ""}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Erro ao carregar receitas.");
      const data = await response.json();
      setReceitas(Array.isArray(data) ? data : data.data ?? []);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    fetchReceitas({ ...filtrosAtivos, search });
  };

  const handleAplicarFiltros = (filtros: Record<string, string>) => {
    setFiltrosAtivos(filtros);
    setFiltrosVisible(false);
    fetchReceitas({ ...filtros, search });
  };

  const handleLimparTudo = () => {
    setSearch("");
    setFiltrosAtivos({});
    fetchReceitas();
  };

  const temFiltrosAtivos = Object.values(filtrosAtivos).some((v) => v) || search.trim();

  const openModal = (receita: Receita) => { setSelected(receita); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setSelected(null); };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Receitas</Text>
        <Text style={styles.headerSub}>para a sua gestação 🌿</Text>
      </View>

      {/* Barra de pesquisa */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome..."
          placeholderTextColor="#a06070"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleBuscar}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, Object.values(filtrosAtivos).some((v) => v) && styles.filterBtnAtivo]}
          onPress={() => setFiltrosVisible(true)}
        >
          <Text style={styles.filterBtnText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Chips dos filtros ativos */}
      {Object.entries(filtrosAtivos).some(([, v]) => v) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosAtivosRow}>
          {Object.entries(filtrosAtivos)
            .filter(([, v]) => v)
            .map(([campo, valor]) => (
              <TouchableOpacity
                key={campo}
                style={styles.filtroAtivoChip}
                onPress={() => {
                  const novos = { ...filtrosAtivos, [campo]: "" };
                  setFiltrosAtivos(novos);
                  fetchReceitas({ ...novos, search });
                }}
              >
                <Text style={styles.filtroAtivoChipText}>{valor} ✕</Text>
              </TouchableOpacity>
            ))}
          <TouchableOpacity style={styles.limparTudoChip} onPress={handleLimparTudo}>
            <Text style={styles.limparTudoText}>Limpar tudo</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#b5405a" style={{ marginTop: 40 }} />
      ) : receitas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma receita encontrada.</Text>
          {temFiltrosAtivos && (
            <TouchableOpacity onPress={handleLimparTudo}>
              <Text style={styles.limparLink}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
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

      <Navbar current="receitas" />
      <ReceitaModal receita={selected} visible={modalVisible} onClose={closeModal} />
      <FiltrosModal
        visible={filtrosVisible}
        filtrosAtivos={filtrosAtivos}
        onAplicar={handleAplicarFiltros}
        onFechar={() => setFiltrosVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8d7da" },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 32, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", color: "#b5405a", fontWeight: "700" },
  headerSub: { fontSize: 14, color: "#a06070", marginTop: 2 },

  // Barra de pesquisa
  searchRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: "#fdf6f0", borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, color: "#3a1a22",
    borderWidth: 1, borderColor: "#e8c8d0",
  },
  searchBtn: { backgroundColor: "#fdf6f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#e8c8d0", justifyContent: "center" },
  searchBtnText: { fontSize: 16 },
  filterBtn: { backgroundColor: "#fdf6f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#e8c8d0", justifyContent: "center" },
  filterBtnAtivo: { backgroundColor: "#b5405a", borderColor: "#b5405a" },
  filterBtnText: { fontSize: 16 },

  // Chips de filtros ativos
  filtrosAtivosRow: { paddingHorizontal: 16, marginBottom: 8 },
  filtroAtivoChip: { backgroundColor: "#b5405a", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  filtroAtivoChipText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  limparTudoChip: { backgroundColor: "#6b7c5c", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  limparTudoText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  list: { paddingHorizontal: 16, paddingBottom: 110 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 15, color: "#a06070" },
  limparLink: { fontSize: 14, color: "#b5405a", fontWeight: "600", textDecorationLine: "underline" },

  card: { backgroundColor: "#fdf6f0", borderRadius: 16, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "#e8c8d0", shadowColor: "#b5405a", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardImageWrap: { width: "100%", height: 160 },
  cardImage: { width: "100%", height: "100%" },
  cardImagePlaceholder: { flex: 1, backgroundColor: "#f8d7da", alignItems: "center", justifyContent: "center" },
  cardImagePlaceholderText: { fontSize: 48 },
  cardBody: { padding: 14 },
  cardNome: { fontSize: 17, fontWeight: "700", color: "#3a1a22", marginBottom: 10, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap" },
});