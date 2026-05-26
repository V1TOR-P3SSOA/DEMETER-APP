import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import * as ImagePicker from "expo-image-picker";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SUPABASE_URL = "https://kfixoncmpzaeecxygabi.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = "receitas-imagens";

const ENUMS = {
  tempo: ["semana 1-4","semana 5-8","semana 9-12","segundo trimestre","terceiro trimestre","pré parto"],
  nutrientes_principais: ["rico em ferro","rico em cálcio","rico em dha","rico em proteínas","rico em fibras","rico em ácido fólico","rico em vitamina c","rico em magnésio","rico em potássio","rico em colina"],
  sintomas_gestacao: ["para enjoo","para azia","para constipação","para fadiga","para inchaço","para anemia","para falta de apetite","para desejos alimentares","energia rápida"],
  restricoes_alimentares: ["vegetariana","vegana","sem lactose","sem glúten","baixo açúcar","sem frutos do mar","sem oleaginosas","diabéticas"],
  tipos_refeicoes: ["café da manhã","lanche","almoço","jantar","sobremesa saudável","ceia","smoothie","marmita","refeição rápida"],
  tempo_preparo: ["até 10 min","até 20 min","até 40 min","prática","uma panela só"],
  objetivo_nutricional: ["ganho de peso saudável","controle glicêmico","aumento de ferro","saúde intestinal","desenvolvimento cerebral do bebê","fortalecimento ósseo","hidratação","imunidade"],
};

function Selector({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {options.map((op) => (
            <TouchableOpacity
              key={op}
              style={[styles.chip, value === op && styles.chipActive]}
              onPress={() => onChange(op)}
            >
              <Text style={[styles.chipText, value === op && styles.chipTextActive]}>
                {op}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function EditReceitaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoUrlAtual, setFotoUrlAtual] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "", ingredientes: "", modo_preparo: "",
    tempo: "", nutrientes_principais: "", sintomas_gestacao: "",
    restricoes_alimentares: "", tipos_refeicoes: "",
    tempo_preparo: "", objetivo_nutricional: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => { fetchReceita(); }, []);

  const fetchReceita = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/receitas/${id}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const r = json.data;
      setForm({
        nome: r.nome, ingredientes: r.ingredientes, modo_preparo: r.modo_preparo,
        tempo: r.tempo, nutrientes_principais: r.nutrientes_principais,
        sintomas_gestacao: r.sintomas_gestacao, restricoes_alimentares: r.restricoes_alimentares,
        tipos_refeicoes: r.tipos_refeicoes, tempo_preparo: r.tempo_preparo,
        objetivo_nutricional: r.objetivo_nutricional,
      });
      setFotoUrlAtual(r.foto_url ?? null);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar a receita.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permissão negada", "Precisamos de acesso à galeria."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const uploadFoto = async (uri: string): Promise<string> => {
    const filename = `receita_${Date.now()}.jpg`;
    const formData = new FormData();
    formData.append("file", { uri, name: filename, type: "image/jpeg" } as any);
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "x-upsert": "true" },
      body: formData,
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
  };

  const handleSalvar = async () => {
    const obrigatorios = Object.entries(form).filter(([, v]) => !v.trim());
    if (obrigatorios.length > 0) {
      Alert.alert("Atenção", "Preencha todos os campos antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      let foto_url = fotoUrlAtual;
      if (fotoUri) foto_url = await uploadFoto(fotoUri);

      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/admin/receitas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, foto_url }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      Alert.alert("Sucesso", "Receita atualizada!", [
        { text: "OK", onPress: () => router.replace("/admin/receitas" as any) },
      ]);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  const fotoExibida = fotoUri ?? fotoUrlAtual;

  return (
    <ScrollView style={styles.outer} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Editar Receita</Text>

      <TouchableOpacity style={styles.fotoBtn} onPress={pickImage}>
        {fotoExibida ? (
          <Image source={{ uri: fotoExibida }} style={styles.fotoPreview} />
        ) : (
          <Text style={styles.fotoBtnText}>+ Adicionar foto</Text>
        )}
      </TouchableOpacity>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Nome da receita</Text>
        <TextInput style={styles.input} value={form.nome} onChangeText={(v) => set("nome", v)} />
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Ingredientes</Text>
        <TextInput style={[styles.input, styles.textArea]} value={form.ingredientes}
          onChangeText={(v) => set("ingredientes", v)} multiline />
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Modo de preparo</Text>
        <TextInput style={[styles.input, styles.textArea]} value={form.modo_preparo}
          onChangeText={(v) => set("modo_preparo", v)} multiline />
      </View>

      <Selector label="Período da gestação" options={ENUMS.tempo}
        value={form.tempo} onChange={(v) => set("tempo", v)} />
      <Selector label="Nutriente principal" options={ENUMS.nutrientes_principais}
        value={form.nutrientes_principais} onChange={(v) => set("nutrientes_principais", v)} />
      <Selector label="Sintoma" options={ENUMS.sintomas_gestacao}
        value={form.sintomas_gestacao} onChange={(v) => set("sintomas_gestacao", v)} />
      <Selector label="Restrição alimentar" options={ENUMS.restricoes_alimentares}
        value={form.restricoes_alimentares} onChange={(v) => set("restricoes_alimentares", v)} />
      <Selector label="Tipo de refeição" options={ENUMS.tipos_refeicoes}
        value={form.tipos_refeicoes} onChange={(v) => set("tipos_refeicoes", v)} />
      <Selector label="Tempo de preparo" options={ENUMS.tempo_preparo}
        value={form.tempo_preparo} onChange={(v) => set("tempo_preparo", v)} />
      <Selector label="Objetivo nutricional" options={ENUMS.objetivo_nutricional}
        value={form.objetivo_nutricional} onChange={(v) => set("objetivo_nutricional", v)} />

      <TouchableOpacity
        style={[styles.btn, saving && { opacity: 0.7 }]}
        onPress={handleSalvar} disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Salvar alterações</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#f5f0e8" },
  scroll: { padding: 24, paddingBottom: 60 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, color: "#b5405a", fontWeight: "700", marginBottom: 24, textAlign: "center" },
  fotoBtn: {
    width: "100%", height: 180, backgroundColor: "#f0ead8", borderRadius: 12,
    borderWidth: 1.5, borderColor: "#d4a0aa", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", marginBottom: 20, overflow: "hidden",
  },
  fotoPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  fotoBtnText: { color: "#b5405a", fontSize: 16, fontWeight: "600" },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 13, color: "#b5405a", fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: "#d4a0aa", borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: "#3a1a22", backgroundColor: "#fdf6f0",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  chips: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#f0ead8", borderWidth: 1, borderColor: "#d4a0aa",
  },
  chipActive: { backgroundColor: "#b5405a", borderColor: "#b5405a" },
  chipText: { fontSize: 13, color: "#3a1a22" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  btn: {
    backgroundColor: "#6b7c5c", borderRadius: 10,
    paddingVertical: 16, alignItems: "center", marginTop: 12,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});