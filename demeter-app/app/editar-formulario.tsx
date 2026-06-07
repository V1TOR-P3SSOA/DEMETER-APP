// app/editar-formulario.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Opções dos checkboxes ────────────────────────────────────────────────────
const OBJETIVOS = [
  "Melhorar alimentação",
  "Acompanhar desenvolvimento do bebê",
  "Controlar nutrientes",
  "Receber dicas",
  "Organizar rotina alimentar",
  "Outro",
];
const RESTRICOES = ["Vegetariana", "Vegana", "Intolerância a lactose", "Alergia alimentar", "Outra", "Nenhuma"];
const SINTOMAS   = ["Náusea", "Azia", "Constipação", "Cansaço", "Inchaço", "Falta de apetite", "Desejo alimentar"];

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (item: string) => {
    if (selected.includes(item)) onChange(selected.filter((i) => i !== item));
    else onChange([...selected, item]);
  };
  return (
    <View style={cb.wrap}>
      {options.map((item) => {
        const checked = selected.includes(item);
        return (
          <TouchableOpacity key={item} style={cb.row} onPress={() => toggle(item)} activeOpacity={0.7}>
            <View style={[cb.box, checked && cb.boxChecked]}>
              {checked && <Text style={cb.check}>✓</Text>}
            </View>
            <Text style={cb.label}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const cb = StyleSheet.create({
  wrap: { marginTop: 6, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: "#d4a0aa", backgroundColor: "#fdf6f0", alignItems: "center", justifyContent: "center", marginRight: 10 },
  boxChecked: { backgroundColor: "#b5405a", borderColor: "#b5405a" },
  check: { color: "#fff", fontSize: 13, fontWeight: "700" },
  label: { fontSize: 14, color: "#3a1a22", flex: 1 },
});

function SuccessToast({ visible }: { visible: boolean }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[toast.container, { transform: [{ translateY }], opacity }]} pointerEvents="none">
      <View style={toast.iconWrap}>
        <Text style={toast.icon}>✓</Text>
      </View>
      <View>
        <Text style={toast.title}>Formulário salvo!</Text>
        <Text style={toast.sub}>Suas informações foram atualizadas.</Text>
      </View>
    </Animated.View>
  );
}

const toast = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 16,
    left: 16, right: 16, zIndex: 999,
    backgroundColor: "#2d5a3d",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 10,
    elevation: 8, gap: 12,
  },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  icon:  { color: "#fff", fontSize: 16, fontWeight: "800" },
  title: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 },
});

// ─── Tela ─────────────────────────────────────────────────────────────────────
export default function EditarFormularioScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [idade, setIdade]                     = useState("");
  const [semanas, setSemanas]                 = useState("");
  const [primeiraGestacao, setPrimeiraGestacao] = useState("");
  const [tipoGestacao, setTipoGestacao]       = useState("");
  const [altura, setAltura]                   = useState("");
  const [peso, setPeso]                       = useState("");
  const [objetivos, setObjetivos]             = useState<string[]>([]);
  const [restricoes, setRestricoes]           = useState<string[]>([]);
  const [sintomas, setSintomas]               = useState<string[]>([]);
  const [suplementos, setSuplementos]         = useState("");
  const [doencas, setDoencas]                 = useState("");
  const [acompanhamento, setAcompanhamento]   = useState("");

  useEffect(() => { carregarFormulario(); }, []);

  async function carregarFormulario() {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/formulario`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data) {
        setIdade(String(data.idade ?? ""));
        setSemanas(String(data.semanas_gestacao ?? ""));
        setPrimeiraGestacao(data.primeira_gestacao ? "Sim" : "Não");
        setTipoGestacao(data.tipo_gestacao ?? "");
        setAltura(String(data.altura ?? ""));
        setPeso(String(data.peso ?? ""));
        setObjetivos(data.objetivos ?? []);
        setRestricoes(data.restricoes_alimentares ?? []);
        setSintomas(data.sintomas ?? []);
        setSuplementos(data.suplementos ?? "");
        setDoencas(data.doencas ?? "");
        setAcompanhamento(
          data.acompanhamento_medico === null ? "" : data.acompanhamento_medico ? "Sim" : "Não"
        );
      }

      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o formulário.");
    } finally {
      setLoading(false);
    }
  }

  function dispararToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  async function handleSalvar() {
    if (!idade || !semanas || !primeiraGestacao || !tipoGestacao || !altura || !peso) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/formulario`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idade,
          semanas_gestacao: semanas,
          primeira_gestacao: primeiraGestacao,
          tipo_gestacao: tipoGestacao,
          altura,
          peso,
          objetivos,
          restricoes_alimentares: restricoes,
          sintomas,
          suplementos,
          doencas,
          acompanhamento_medico: acompanhamento,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        throw new Error(data.message || "Erro ao salvar.");
      }

      dispararToast();
      await carregarFormulario();

    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={s.centralizador}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />
        <ActivityIndicator size="large" color="#b5405a" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.outer}
      behavior="padding"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />
      <SuccessToast visible={showToast} />
      
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>

          {/* Cabeçalho */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Text style={s.backText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={s.titulo}>Editar Formulário</Text>
            <Text style={s.subtitulo}>Atualize suas informações gestacionais</Text>
          </View>

          <View style={s.body}>

            <View style={s.card}>
              <Text style={s.label}>Qual sua idade?</Text>
              <TextInput style={s.input} keyboardType="numeric" value={idade} onChangeText={setIdade} placeholder="Ex: 28" placeholderTextColor="#c8a0a8" />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Com quantas semanas de gravidez você está?</Text>
              <TextInput style={s.input} keyboardType="numeric" value={semanas} onChangeText={setSemanas} placeholder="Ex: 12" placeholderTextColor="#c8a0a8" />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Essa é sua primeira gestação?</Text>
              <TextInput style={s.input} value={primeiraGestacao} onChangeText={setPrimeiraGestacao} placeholder="Sim ou Não" placeholderTextColor="#c8a0a8" />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Gestação única ou gemelar?</Text>
              <TextInput style={s.input} value={tipoGestacao} onChangeText={setTipoGestacao} placeholder="Única ou Gemelar" placeholderTextColor="#c8a0a8" />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Qual sua altura? (cm)</Text>
              <TextInput style={s.input} keyboardType="numeric" value={altura} onChangeText={setAltura} placeholder="Ex: 165" placeholderTextColor="#c8a0a8" />
              <Text style={[s.label, { marginTop: 10 }]}>Qual seu peso? (kg)</Text>
              <TextInput style={s.input} keyboardType="numeric" value={peso} onChangeText={setPeso} placeholder="Ex: 65" placeholderTextColor="#c8a0a8" />
            </View>

            <View style={s.card}>
              <Text style={s.label}>O que você busca no app?</Text>
              <CheckboxGroup options={OBJETIVOS} selected={objetivos} onChange={setObjetivos} />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Você possui alguma restrição alimentar?</Text>
              <CheckboxGroup options={RESTRICOES} selected={restricoes} onChange={setRestricoes} />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Você sente algum desses sintomas?</Text>
              <CheckboxGroup options={SINTOMAS} selected={sintomas} onChange={setSintomas} />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Você utiliza vitaminas ou suplementos?</Text>
              <TextInput style={s.input} value={suplementos} onChangeText={setSuplementos} placeholder="Descreva ou escreva 'Não'" placeholderTextColor="#c8a0a8" />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Você possui alguma doença?</Text>
              <TextInput style={s.input} value={doencas} onChangeText={setDoencas} placeholder="Descreva ou escreva 'Não'" placeholderTextColor="#c8a0a8" />
            </View>

            <View style={s.card}>
              <Text style={s.label}>Tem acompanhamento médico ou nutricional?</Text>
              <TextInput style={s.input} value={acompanhamento} onChangeText={setAcompanhamento} placeholder="Sim ou Não" placeholderTextColor="#c8a0a8" />
            </View>

            <TouchableOpacity
              style={[s.btn, saving && { opacity: 0.7 }]}
              onPress={handleSalvar}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#f5f0e8" />
                : <Text style={s.btnText}>Salvar alterações</Text>
              }
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ROSA       = "#b5405a";
const ROSA_CLARO = "#f8d7da";
const ROSA_BORDA = "#e8c8d0";
const CREME_CARD = "#f0ead8";
const SUAVE      = "#a07080";
const CREME      = "#f5f0e8";
const VERDE      = "#6b7c5c";

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: ROSA_CLARO },
  scroll: { flexGrow: 1 },
  centralizador: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: ROSA_CLARO },

  header: {
    backgroundColor: ROSA,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: "#f8d7da", fontSize: 14, fontWeight: "600" },
  titulo: {
    fontSize: 26,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitulo: { fontSize: 13, color: "#f8d7da" },

  body: {
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: ROSA_CLARO,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  card: {
    backgroundColor: CREME_CARD,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: ROSA_BORDA,
  },
  label: {
    fontSize: 14,
    color: ROSA,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 10,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#3a1a22",
    backgroundColor: "#fff8f5",
  },

  btn: {
    backgroundColor: VERDE,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#3a4a2c",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: { fontSize: 16, fontWeight: "700", color: CREME, letterSpacing: 0.3 },
});