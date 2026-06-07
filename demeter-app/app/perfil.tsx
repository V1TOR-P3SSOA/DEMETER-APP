// app/perfil.tsx
import React, { useCallback, useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, Platform, Image,
  Animated, Modal, TextInput,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path } from "react-native-svg";
import Navbar from "../components/Navbar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Usuario = {
  id: number;
  nome: string;
  email: string;
  foto_url: string | null;
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

type Perfil = { usuario: Usuario; formulario: Formulario | null };

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

async function uploadFoto(uri: string): Promise<string> {
  const token = await getToken();
  const formData = new FormData();
  const filename = uri.split("/").pop() ?? "foto.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";
  formData.append("foto", { uri, name: filename, type } as any);
  const res = await fetch(`${API_URL}/api/perfil/foto`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: formData,
  });
  if (!res.ok) throw new Error("Erro ao enviar foto.");
  const data = await res.json();
  return data.foto_url;
}

async function deletarConta(): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/perfil`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Erro ao deletar conta.");
}

async function logout(): Promise<void> {
  const token = await getToken();
  await fetch(`${API_URL}/api/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  await AsyncStorage.removeItem("auth_token");
}

// ─── Ícone de editar (SVG) ────────────────────────────────────────────────────
function IconEdit() {
  return (
    <Svg width={22} height={22} viewBox="0 0 16 16" fill="none">
      <Path
        d="M7.125 2.2526H2.16667C1.79094 2.2526 1.43061 2.40186 1.16493 2.66753C0.899255 2.93321 0.75 3.29355 0.75 3.66927V13.5859C0.75 13.9617 0.899255 14.322 1.16493 14.5877C1.43061 14.8533 1.79094 15.0026 2.16667 15.0026H12.0833C12.4591 15.0026 12.8194 14.8533 13.0851 14.5877C13.3507 14.322 13.5 13.9617 13.5 13.5859V8.6276M12.4375 1.1901C12.7193 0.908309 13.1015 0.75 13.5 0.75C13.8985 0.75 14.2807 0.908309 14.5625 1.1901C14.8443 1.47189 15.0026 1.85409 15.0026 2.2526C15.0026 2.65112 14.8443 3.03331 14.5625 3.3151L7.83333 10.0443L5 10.7526L5.70833 7.91927L12.4375 1.1901Z"
        stroke="#D4476B"
        strokeOpacity={0.8}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Modal de edição de usuário ───────────────────────────────────────────────
function EditarUsuarioModal({
  visible, usuario, onClose, onSave,
}: {
  visible: boolean; usuario: Usuario; onClose: () => void; onSave: (u: Usuario) => void;
}) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => { setNome(usuario.nome); setEmail(usuario.email); }, [usuario]);

  const handleSave = async () => {
    if (!nome.trim() || !email.trim()) { Alert.alert("Atenção", "Preencha todos os campos."); return; }
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
          <TextInput style={m.input} value={nome} onChangeText={setNome} autoCapitalize="words" />
          <Text style={m.label}>E-mail</Text>
          <TextInput style={m.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TouchableOpacity style={[m.btn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#f5f0e8" /> : <Text style={m.btnText}>Salvar</Text>}
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
  sheet: { backgroundColor: "#fdf6f0", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  titulo: { fontSize: 20, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", color: "#b5405a", fontWeight: "700", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 13, color: "#a07080", marginBottom: 6, marginTop: 4 },
  input: { borderWidth: 1.5, borderColor: "#d4a0aa", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: "#3a1a22", backgroundColor: "#fff8f5", marginBottom: 14 },
  btn: { backgroundColor: "#6b7c5c", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 4 },
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

function TagList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <Text style={s.semDados}>Nenhum</Text>;
  return (
    <View style={s.tagWrap}>
      {items.map((item, i) => (
        <View key={i} style={s.tag}><Text style={s.tagText}>{item}</Text></View>
      ))}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function PerfilScreen() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Recarrega toda vez que a tela recebe foco (inclusive ao voltar do editar-formulario)
  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

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

  const handleSair = () => {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair", style: "destructive", onPress: async () => {
          await logout();
          router.replace("/login" as any);
        },
      },
    ]);
  };

  const handleFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de acesso à sua galeria.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    setUploadingFoto(true);
    try {
      const novaUrl = await uploadFoto(result.assets[0].uri);
      if (perfil) setPerfil({ ...perfil, usuario: { ...perfil.usuario, foto_url: novaUrl } });
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleDeletar = () => {
    Alert.alert(
      "Deletar conta",
      "Tem certeza? Essa ação é irreversível e todos os seus dados serão perdidos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar", style: "destructive", onPress: async () => {
            try {
              await deletarConta();
              await AsyncStorage.removeItem("auth_token");
              router.replace("/login" as any);
            } catch (err: any) {
              Alert.alert("Erro", err.message);
            }
          },
        },
      ]
    );
  };

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
      <StatusBar barStyle="light-content" backgroundColor={ROSA} />

      <EditarUsuarioModal
        visible={editModalVisible}
        usuario={usuario}
        onClose={() => setEditModalVisible(false)}
        onSave={(u) => setPerfil({ ...perfil, usuario: u })}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: "100%" }}>

          {/* ── Header ── */}
          <View style={s.header}>
            <Image
              source={require("../assets/images/header-bg.png")}
              style={s.headerBg}
              resizeMode="cover"
            />

            <TouchableOpacity style={s.sairBtn} onPress={handleSair}>
              <Text style={s.sairIcon}>⇒</Text>
              <Text style={s.sairText}>Sair</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.avatarWrap} onPress={handleFoto} activeOpacity={0.85}>
              {usuario.foto_url ? (
                <Image source={{ uri: usuario.foto_url }} style={s.avatarImage} />
              ) : (
                <View style={s.avatarPlaceholder}>
                  <Text style={s.avatarPlaceholderIcon}>👤</Text>
                </View>
              )}
              <View style={s.uploadBadge}>
                {uploadingFoto
                  ? <ActivityIndicator size="small" color={ROSA} />
                  : (
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={ROSA} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )
                }
              </View>
            </TouchableOpacity>

            <Text style={s.headerNome}>{usuario.nome}</Text>
            <Text style={s.headerEmail}>{usuario.email}</Text>
          </View>

          {/* ── Body ── */}
          <View style={s.body}>

            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitulo}>Dados da conta</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(true)} style={s.editBtnWrap}>
                  <IconEdit />
                </TouchableOpacity>
              </View>
              <View style={s.divisor} />
              <InfoLinha rotulo="Nome:" valor={usuario.nome} />
              <View style={s.divisor} />
              <InfoLinha rotulo="E-mail:" valor={usuario.email} />
            </View>

            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitulo}>Dados gestacionais</Text>
                <TouchableOpacity onPress={() => router.push("/editar-formulario" as any)} style={s.editBtnWrap}>
                  <IconEdit />
                </TouchableOpacity>
              </View>
              <View style={s.divisor} />

              {!formulario ? (
                <Text style={s.semDados}>Formulário não preenchido ainda.</Text>
              ) : (
                <>
                  <InfoLinha rotulo="Idade:" valor={`${formulario.idade} anos`} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Semanas de gestação:" valor={`${formulario.semanas_gestacao} semanas`} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Primeira gestação:" valor={formulario.primeira_gestacao ? "Sim" : "Não"} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Tipo de gestação:" valor={formulario.tipo_gestacao} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Altura:" valor={`${formulario.altura} cm`} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Peso:" valor={`${formulario.peso} kg`} />
                  <View style={s.divisor} />

                  <Text style={s.subTitulo}>Objetivos no app:</Text>
                  <TagList items={formulario.objetivos} />
                  <View style={s.divisor} />

                  <Text style={s.subTitulo}>Restrições alimentares:</Text>
                  <TagList items={formulario.restricoes_alimentares} />
                  <View style={s.divisor} />

                  <Text style={s.subTitulo}>Sintomas:</Text>
                  <TagList items={formulario.sintomas} />
                  <View style={s.divisor} />

                  <InfoLinha rotulo="Suplementos:" valor={formulario.suplementos || "Não"} />
                  <View style={s.divisor} />
                  <InfoLinha rotulo="Doenças:" valor={formulario.doencas || "Não"} />
                  <View style={s.divisor} />
                  <InfoLinha
                    rotulo="Acompanhamento médico:"
                    valor={
                      formulario.acompanhamento_medico === null ? "Não informado"
                        : formulario.acompanhamento_medico ? "Sim" : "Não"
                    }
                  />
                </>
              )}
            </View>

            <TouchableOpacity style={s.deletarBtn} onPress={handleDeletar} activeOpacity={0.85}>
              <Text style={s.deletarBtnText}>💔  Deletar conta</Text>
            </TouchableOpacity>

            <View style={{ height: 110 }} />
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
const TEXTO      = "#3a1a22";
const SUAVE      = "#a07080";
const CREME      = "#f5f0e8";

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: ROSA_CLARO },
  scroll: { flexGrow: 1 },

  centralizador: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: ROSA_CLARO, padding: 24 },
  textoCarregando: { marginTop: 12, color: SUAVE, fontSize: 15 },
  textoErro: { color: ROSA, fontSize: 15, textAlign: "center", marginBottom: 16 },
  btnTentar: { backgroundColor: ROSA, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  btnTentarTexto: { color: CREME, fontWeight: "700", fontSize: 14 },

  header: {
    backgroundColor: ROSA,
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 56,
    overflow: "hidden",
    position: "relative",
  },
  headerBg: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    width: "100%", height: "100%",
    opacity: 0.35,
  },

  sairBtn: {
    position: "absolute",
    top: 16, right: 16,
    alignItems: "center",
    zIndex: 10,
  },
  sairIcon: { fontSize: 26, color: "#fff" },
  sairText: { fontSize: 12, color: "#f8d7da", marginTop: 2, fontWeight: "600" },

  avatarWrap: {
    width: 110, height: 110, borderRadius: 55,
    marginBottom: 14, position: "relative", zIndex: 5,
  },
  avatarImage: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  avatarPlaceholderIcon: { fontSize: 40 },
  uploadBadge: {
    position: "absolute", bottom: 4, right: 4,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 3,
  },

  headerNome: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#fff", fontWeight: "700", marginBottom: 4, zIndex: 5,
  },
  headerEmail: { fontSize: 13, color: "#f8d7da", zIndex: 5 },

  body: {
    marginTop: -24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    backgroundColor: ROSA_CLARO,
    paddingHorizontal: 20, paddingTop: 24,
  },

  card: {
    backgroundColor: "#FDF6EE",
    borderRadius: 16, padding: 18, marginBottom: 16,
    borderWidth: 1.5, borderColor: ROSA_BORDA,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  cardTitulo: {
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontWeight: "700", color: ROSA,
  },
  editBtnWrap: { padding: 4 },

  linha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  rotulo: { fontSize: 13, color: SUAVE, flex: 1 },
  valor: { fontSize: 14, fontWeight: "600", color: TEXTO, flex: 2, textAlign: "right" },
  divisor: { height: 1, backgroundColor: ROSA_BORDA, marginVertical: 6 },
  subTitulo: { fontSize: 13, color: SUAVE, marginBottom: 8, marginTop: 4 },

  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  tag: {
    backgroundColor: ROSA_CLARO, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: ROSA_BORDA,
  },
  tagText: { fontSize: 12, color: ROSA, fontWeight: "500" },

  semDados: { fontSize: 14, color: SUAVE, textAlign: "center", paddingVertical: 8 },

  deletarBtn: {
    backgroundColor: "#e05555", borderRadius: 12,
    paddingVertical: 15, alignItems: "center", marginBottom: 8,
    shadowColor: "#900",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  deletarBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },

  navbarWrap: { position: "absolute", bottom: 0, left: 0, right: 0 },
});