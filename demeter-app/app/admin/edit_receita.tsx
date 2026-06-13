// app/admin/edit_receita.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  Image, Modal, Platform, StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import * as ImagePicker from "expo-image-picker";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SUPABASE_URL = "https://kfixoncmpzaeecxygabi.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = "receitas-imagens";

// ─── Cores ────────────────────────────────────────────────────────────────────
const ROSA       = "#b5405a";
const ROSA_CLARO = "#fce8ed";
const ROSA_BORDA = "#e8b0be";
const CREME      = "#fdf6f0";
const VERDE      = "#6b7c5c";
const TEXTO      = "#3a1a22";
const SUAVE      = "#9a7080";

// ─── Enums ────────────────────────────────────────────────────────────────────
const ENUMS: Record<string, { label: string; options: string[] }> = {
  tempo:                  { label: "Período da gestação",   options: ["semana 1-4","semana 5-8","semana 9-12","segundo trimestre","terceiro trimestre","pré parto"] },
  nutrientes_principais:  { label: "Nutriente principal",   options: ["rico em ferro","rico em cálcio","rico em dha","rico em proteínas","rico em fibras","rico em ácido fólico","rico em vitamina c","rico em magnésio","rico em potássio","rico em colina"] },
  sintomas_gestacao:      { label: "Sintoma",               options: ["para enjoo","para azia","para constipação","para fadiga","para inchaço","para anemia","para falta de apetite","para desejos alimentares","energia rápida"] },
  restricoes_alimentares: { label: "Restrição alimentar",   options: ["vegetariana","vegana","sem lactose","sem glúten","baixo açúcar","sem frutos do mar","sem oleaginosas","diabéticas"] },
  tipos_refeicoes:        { label: "Tipo de refeição",      options: ["café da manhã","lanche","almoço","jantar","sobremesa saudável","ceia","smoothie","marmita","refeição rápida"] },
  tempo_preparo:          { label: "Tempo de preparo",      options: ["até 10 min","até 20 min","até 40 min","prática","uma panela só"] },
  objetivo_nutricional:   { label: "Objetivo nutricional",  options: ["ganho de peso saudável","controle glicêmico","aumento de ferro","saúde intestinal","desenvolvimento cerebral do bebê","fortalecimento ósseo","hidratação","imunidade"] },
};

// ─── Modal de tags ────────────────────────────────────────────────────────────
function TagsModal({
  visible, form, onClose, onConfirm,
}: {
  visible: boolean;
  form: Record<string, string>;
  onClose: () => void;
  onConfirm: (vals: Record<string, string>) => void;
}) {
  const [local, setLocal] = useState<Record<string, string>>(form);

  useEffect(() => { setLocal(form); }, [visible]);

  const toggle = (field: string, val: string) =>
    setLocal((prev) => ({ ...prev, [field]: prev[field] === val ? "" : val }));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={tm.overlay}>
        <View style={tm.sheet}>
          <Text style={tm.titulo}>Selecionar Tags</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            {Object.entries(ENUMS).map(([field, { label, options }]) => (
              <View key={field} style={tm.grupo}>
                <Text style={tm.grupoLabel}>{label}</Text>
                <View style={tm.chips}>
                  {options.map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[tm.chip, local[field] === op && tm.chipAtivo]}
                      onPress={() => toggle(field, op)}
                    >
                      <Text style={[tm.chipText, local[field] === op && tm.chipTextAtivo]}>
                        {op}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={tm.btn} onPress={() => onConfirm(local)}>
            <Text style={tm.btnText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const tm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#00000055", justifyContent: "flex-end" },
  sheet: { backgroundColor: CREME, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "90%" },
  titulo: { fontSize: 18, fontWeight: "700", color: ROSA, marginBottom: 16, textAlign: "center", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  grupo: { marginBottom: 16 },
  grupoLabel: { fontSize: 12, fontWeight: "700", color: SUAVE, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "#f0ead8", borderWidth: 1, borderColor: ROSA_BORDA },
  chipAtivo: { backgroundColor: ROSA, borderColor: ROSA },
  chipText: { fontSize: 12, color: TEXTO },
  chipTextAtivo: { color: "#fff", fontWeight: "600" },
  btn: { backgroundColor: VERDE, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function EditReceitaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoUrlAtual, setFotoUrlAtual] = useState<string | null>(null);
  const [tagsModal, setTagsModal] = useState(false);
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
      const r = json.data ?? json;
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
    if (obrigatorios.length > 0) { Alert.alert("Atenção", "Preencha todos os campos antes de salvar."); return; }

    setSaving(true);
    try {
      let foto_url = fotoUrlAtual;
      if (fotoUri) foto_url = await uploadFoto(fotoUri);

      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/admin/receitas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
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

  const tagFields = ["tempo","nutrientes_principais","sintomas_gestacao","restricoes_alimentares","tipos_refeicoes","tempo_preparo","objetivo_nutricional"];
  const tagsSelecionadas = tagFields.filter((f) => (form as any)[f]);
  const tagsLabel = tagsSelecionadas.length === 0
    ? "Selecione as tags"
    : "Veja as tags selecionadas";

  const fotoExibida = fotoUri ?? fotoUrlAtual;

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />
        <ActivityIndicator size="large" color={ROSA} />
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar{"\n"}receita</Text>
        <Image source={require("../../assets/images/demeter.png")} style={styles.headerLogo} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Upload foto */}
        <TouchableOpacity style={styles.fotoBtn} onPress={pickImage} activeOpacity={0.85}>
          {fotoExibida ? (
            <>
              <Image source={{ uri: fotoExibida }} style={styles.fotoPreview} />
              <View style={styles.fotoOverlay}>
                <Text style={styles.fotoOverlayText}>↑ Trocar foto</Text>
              </View>
            </>
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Text style={styles.fotoIcone}>↑</Text>
              <Text style={styles.fotoBtnText}>Faça upload de uma foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Título */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Título:</Text>
          <TextInput
            style={styles.input}
            value={form.nome}
            onChangeText={(v) => set("nome", v)}
            placeholderTextColor={SUAVE}
          />
        </View>

        {/* Tags */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Tags:</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setTagsModal(true)} activeOpacity={0.8}>
            <Text style={[styles.dropdownText, tagsSelecionadas.length > 0 && styles.dropdownTextAtivo]}>
              {tagsLabel}
            </Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>
          {tagsSelecionadas.length > 0 && (
            <View style={styles.tagsResumo}>
              {tagsSelecionadas.map((f) => (
                <View key={f} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{(form as any)[f]}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Ingredientes */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Ingredientes:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.ingredientes}
            onChangeText={(v) => set("ingredientes", v)}
            multiline
            placeholderTextColor={SUAVE}
            textAlignVertical="top"
          />
        </View>

        {/* Modo de preparo */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Modo de preparo:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.modo_preparo}
            onChangeText={(v) => set("modo_preparo", v)}
            multiline
            placeholderTextColor={SUAVE}
            textAlignVertical="top"
          />
        </View>

        {/* Botão */}
        <TouchableOpacity style={[styles.btn, saving && { opacity: 0.7 }]} onPress={handleSalvar} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Atualizar</Text>}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      <TagsModal
        visible={tagsModal}
        form={form}
        onClose={() => setTagsModal(false)}
        onConfirm={(vals) => { setForm((prev) => ({ ...prev, ...vals })); setTagsModal(false); }}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: ROSA_CLARO },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ROSA_CLARO },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 20,
    paddingBottom: 12,
    backgroundColor: ROSA_CLARO,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backIcon: { fontSize: 32, color: ROSA, lineHeight: 36 },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: ROSA,
    lineHeight: 30,
  },
  headerLogo: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#f8d7da" },

  fotoBtn: {
    width: "100%", height: 160, borderRadius: 16,
    borderWidth: 1.5, borderColor: ROSA_BORDA, borderStyle: "dashed",
    overflow: "hidden", marginBottom: 20, backgroundColor: "#fff",
  },
  fotoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  fotoIcone: { fontSize: 28, color: ROSA_BORDA },
  fotoPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  fotoOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(181,64,90,0.6)", paddingVertical: 8, alignItems: "center",
  },
  fotoOverlayText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  fotoBtnText: { color: SUAVE, fontSize: 14 },

  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, color: ROSA, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: ROSA_BORDA, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: TEXTO, backgroundColor: "#fff",
  },
  textArea: { minHeight: 110, textAlignVertical: "top" },

  dropdown: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderColor: ROSA_BORDA, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#fff",
  },
  dropdownText: { fontSize: 14, color: SUAVE, flex: 1 },
  dropdownTextAtivo: { color: ROSA, fontWeight: "600" },
  chevron: { fontSize: 18, color: SUAVE },

  tagsResumo: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tagChip: { backgroundColor: ROSA_CLARO, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: ROSA_BORDA },
  tagChipText: { fontSize: 11, color: ROSA, fontWeight: "500" },

  btn: { backgroundColor: ROSA, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});