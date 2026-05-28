// app/perfil.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Image,
  Animated,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../components/Navbar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Usuario = {
  id: number;
  nome: string;
  email: string;
};

type Formulario = {
  idade: number;
  semanas_gestacao: number;
  primeira_gestacao: boolean;
  tipo_gestacao: string;
  altura: number;
  peso: number;
  objetivos: string[];
  restricoes_alimentares: string[];
  sintomas: string[];
  suplementos: string | null;
  doencas: string | null;
  acompanhamento_medico: boolean | null;
};

type Perfil = {
  usuario: Usuario;
  formulario: Formulario | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getToken() {
  return await AsyncStorage.getItem("auth_token");
}

async function fetchPerfil(): Promise<Perfil> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/perfil`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Erro ao buscar perfil.");
  return res.json();
}

async function updateUsuario(nome: string, email: string): Promise<Usuario> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/perfil`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, email }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Erro ao atualizar.");
  }
  const data = await res.json();
  return data.usuario;
}

// ─── Modal de edição de usuário ───────────────────────────────────────────────
function EditarUsuarioModal({
  visible,
  usuario,
  onClose,
  onSave,
}: {
  visible: boolean;
  usuario: Usuario;
  onClose: () => void;
  onSave: (u: Usuario) => void;
}) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNome(usuario.nome);
    setEmail(usuario.email);
  }, [usuario]);

  const handleSave = async () => {
    if (!nome.trim() || !email.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const updated = await updateUsuario(nome.trim(), email.trim());
      onSave(updated);
      onClose();
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <Text style={m.titulo}>Editar dados</Text>

          <Text style={m.label}>Nome</Text>
          <TextInput
            style={m.input}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <Text style={m.label}>E-mail</Text>
          <TextInput
            style={m.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[m.btn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#f5f0e8" />
              : <Text style={m.btnText}>Salvar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={m.cancelBtn} onPress={onClose}>
            <Text style={m.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000055", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fdf6f0",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#b5405a",
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontSize: 13, color: "#a07080", marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1.5,
    borderColor: "#d4a0aa",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#3a1a22",
    backgroundColor: "#fff8f5",
    marginBottom: 14,
  },
  btn: {
    backgroundColor: "#6b7c5c",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#f5f0e8", fontSize: 15, fontWeight: "700" },
  cancelBtn: { alignItems: "center", marginTop: 14 },
  cancelText: { color: "#a07080", fontSize: 14 },
});

// ─── Linha de info ────────────────────────────────────────────────────────────
function InfoLinha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={s.linha}>
      <Text style={s.rotulo}>{rotulo}</Text>
      <Text style={s.valor}>{valor}</Text>
    </View>
  );
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
function TagList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <Text style={s.valor}>Nenhum</Text>;
  return (
    <View style={s.tagWrap}>
      {items.map((item, i) => (
        <View key={i} style={s.tag}>
          <Text style={s.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function PerfilScreen() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => { carregarPerfil(); }, []);

  async function carregarPerfil() {
    try {
      setLoading(true);
      setErro(null);
      const data = await fetchPerfil();
      setPerfil(data);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]).start();
    } catch {
      setErro("Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={s.centralizador}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />
        <ActivityIndicator size="large" color="#b5405a" />
        <Text style={s.textoCarregando}>Carregando perfil...</Text>
      </View>
    );
  }

  if (erro || !perfil) {
    return (
      <View style={s.centralizador}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />
        <Text style={s.textoErro}>{erro}</Text>
        <TouchableOpacity style={s.btnTentar} onPress={carregarPerfil}>
          <Text style={s.btnTentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { usuario, formulario } = perfil;

  return (
    <View style={s.outer}>
      <StatusBar barStyle="light-content" backgroundColor="#b5405a" />

      {/* Modal editar usuário */}
      <EditarUsuarioModal
        visible={editModalVisible}
        usuario={usuario}
        onClose={() => setEditModalVisible(false)}
        onSave={(u) => setPerfil({ ...perfil, usuario: u })}
      />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: "100%" }}>

          {/* ── Header rosa ── */}
          <View style={s.header}>
            <View style={s.avatarCircle}>
              <Image
                source={require("../assets/images/demeter.png")}
                style={s.avatarImage}
                resizeMode="cover"
              />
            </View>
            <Text style={s.headerNome}>{usuario.nome}</Text>
            <Text style={s.headerEmail}>{usuario.email}</Text>
          </View>

          <View style={s.body}>

            {/* ── Card: Dados do usuário ── */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitulo}>Dados da conta</Text>
                <TouchableOpacity
                  style={s.editBtn}
                  onPress={() => setEditModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={s.editBtnText}>Editar</Text>
                </TouchableOpacity>
              </View>
              <View style={s.divisor} />
              <InfoLinha rotulo="Nome" valor={usuario.nome} />
              <View style={s.divisor} />
              <InfoLinha rotulo="E-mail" valor={usuario.email} />
            </View>

            {/* ── Card: Formulário gestacional ── */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitulo}>Dados gestacionais</Text>
                <TouchableOpacity
                  style={s.editBtn}
                  onPress={() => router.push("/editar-formulario" as any)}
                  activeOpacity={0.8}
                >
                  <Text style={s.editBtnText}>Editar</Text>
                </TouchableOpacity>
              </View>
              <View style={s.divisor} />

              {!formulario ? (
                <Text style={s.semDados}>Formulário não preenchido ainda.</Text>
              ) : (
                <>
                  <InfoLinha rotulo="Idade" valor={`${formulario.idade} anos`} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Semanas de gestação" valor={`${formulario.semanas_gestacao} semanas`} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Primeira gestação" valor={formulario.primeira_gestacao ? "Sim" : "Não"} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Tipo de gestação" valor={formulario.tipo_gestacao} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Altura" valor={`${formulario.altura} cm`} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Peso" valor={`${formulario.peso} kg`} />
                  <View style={s.divisor} />

                  <Text style={s.subTitulo}>Objetivos no app</Text>
                  <TagList items={formulario.objetivos} />
                  <View style={s.divisor} />

                  <Text style={s.subTitulo}>Restrições alimentares</Text>
                  <TagList items={formulario.restricoes_alimentares} />
                  <View style={s.divisor} />

                  <Text style={s.subTitulo}>Sintomas</Text>
                  <TagList items={formulario.sintomas} />
                  <View style={s.divisor} />

                  <InfoLinha rotulo="Suplementos" valor={formulario.suplementos || "Nenhum"} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Doenças" valor={formulario.doencas || "Nenhuma"} />
                  <View style={s.divisor} />
                  <InfoLinha
                    rotulo="Acompanhamento médico"
                    valor={
                      formulario.acompanhamento_medico === null
                        ? "Não informado"
                        : formulario.acompanhamento_medico ? "Sim" : "Não"
                    }
                  />
                </>
              )}
            </View>

            <View style={{ height: 100 }} />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={s.navbarWrap}>
        <Navbar current="perfil" />
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const ROSA       = "#b5405a";
const ROSA_CLARO = "#f8d7da";
const ROSA_BORDA = "#e8c8d0";
const CREME_CARD = "#f0ead8";
const TEXTO      = "#3a1a22";
const SUAVE      = "#a07080";
const VERDE      = "#6b7c5c";
const CREME      = "#f5f0e8";

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: ROSA_CLARO },

  scroll: { flexGrow: 1 },

  centralizador: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: ROSA_CLARO, padding: 24 },
  textoCarregando: { marginTop: 12, color: SUAVE, fontSize: 15 },
  textoErro: { color: ROSA, fontSize: 15, textAlign: "center", marginBottom: 16 },
  btnTentar: { backgroundColor: ROSA, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  btnTentarTexto: { color: CREME, fontWeight: "700", fontSize: 14 },

  // Header
  header: {
    backgroundColor: ROSA,
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 52,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: ROSA_CLARO,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 12,
  },
  avatarImage: { width: "100%", height: "100%" },
  headerNome: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },
  headerEmail: { fontSize: 13, color: "#f8d7da" },

  // Body
  body: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: ROSA_CLARO,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Card
  card: {
    backgroundColor: CREME_CARD,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitulo: {
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontWeight: "700",
    color: ROSA,
  },
  editBtn: {
    backgroundColor: ROSA,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  editBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Linhas
  linha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  rotulo: { fontSize: 13, color: SUAVE, flex: 1 },
  valor: { fontSize: 14, fontWeight: "600", color: TEXTO, flex: 2, textAlign: "right" },
  divisor: { height: 1, backgroundColor: ROSA_BORDA, marginVertical: 6 },

  subTitulo: { fontSize: 13, color: SUAVE, marginBottom: 8, marginTop: 4 },

  // Tags
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  tag: {
    backgroundColor: ROSA_CLARO,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: ROSA_BORDA,
  },
  tagText: { fontSize: 12, color: ROSA, fontWeight: "500" },

  semDados: { fontSize: 14, color: SUAVE, textAlign: "center", paddingVertical: 8 },

  navbarWrap: { position: "absolute", bottom: 0, left: 0, right: 0 },
});