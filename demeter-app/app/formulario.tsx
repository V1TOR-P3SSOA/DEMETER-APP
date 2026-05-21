// app/formulario.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
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

const RESTRICOES = [
  "Vegetariana",
  "Vegana",
  "Intolerância a lactose",
  "Alergia alimentar",
  "Outra",
  "Nenhuma",
];

const SINTOMAS = [
  "Náusea",
  "Azia",
  "Constipação",
  "Cansaço",
  "Inchaço",
  "Falta de apetite",
  "Desejo alimentar",
];
// ─────────────────────────────────────────────────────────────────────────────

// Componente de checkbox
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
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <View style={cb.wrap}>
      {options.map((item) => {
        const checked = selected.includes(item);
        return (
          <TouchableOpacity
            key={item}
            style={cb.row}
            onPress={() => toggle(item)}
            activeOpacity={0.7}
          >
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#d4a0aa",
    backgroundColor: "#fdf6f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  boxChecked: {
    backgroundColor: "#b5405a",
    borderColor: "#b5405a",
  },
  check: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    color: "#3a1a22",
    flex: 1,
  },
});

// ─── Componente de select ─────────────────────────────────────────────────────
function SelectGroup({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
}) {
  return (
    <View style={sl.wrap}>
      {options.map((item) => {
        const active = selected === item;
        return (
          <TouchableOpacity
            key={item}
            style={[sl.option, active && sl.optionActive]}
            onPress={() => onChange(item)}
            activeOpacity={0.7}
          >
            <View style={[sl.radio, active && sl.radioActive]}>
              {active && <View style={sl.radioDot} />}
            </View>
            <Text style={[sl.label, active && sl.labelActive]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const sl = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#d4a0aa",
    backgroundColor: "#fff8f5",
    flex: 1,
    minWidth: 100,
  },
  optionActive: {
    backgroundColor: "#b5405a",
    borderColor: "#b5405a",
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#d4a0aa",
    backgroundColor: "#fdf6f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioActive: {
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 14,
    color: "#3a1a22",
    fontWeight: "500",
  },
  labelActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function FormularioScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [idade, setIdade] = useState("");
  const [semanas, setSemanas] = useState("");
  const [primeiraGestacao, setPrimeiraGestacao] = useState("");
  const [tipoGestacao, setTipoGestacao] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [suplementos, setSuplementos] = useState("");
  const [doencas, setDoencas] = useState("");
  const [acompanhamento, setAcompanhamento] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    if (!idade || !semanas || !primeiraGestacao || !tipoGestacao || !altura || !peso) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(`${API_URL}/api/formulario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
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

      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        throw new Error(data.message || "Erro ao salvar formulário.");
      }

      router.replace("/home" as any);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior="padding"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 300 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>

          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Formulário</Text>
              <Text style={styles.title}>Gestacional</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Image
                source={require("../assets/images/demeter.png")}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Pergunta 1 */}
          <View style={styles.card}>
            <Text style={styles.label}>Qual sua idade?</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={idade}
              onChangeText={setIdade}
              placeholder="Ex: 28"
              placeholderTextColor="#c8a0a8"
            />
          </View>

          {/* Pergunta 2 */}
          <View style={styles.card}>
            <Text style={styles.label}>Com quantas semanas de gravidez você está?</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={semanas}
              onChangeText={setSemanas}
              placeholder="Ex: 12"
              placeholderTextColor="#c8a0a8"
            />
          </View>

          {/* Pergunta 3 — Select: Sim / Não */}
          <View style={styles.card}>
            <Text style={styles.label}>Essa é sua primeira gestação?</Text>
            <SelectGroup
              options={["Sim", "Não"]}
              selected={primeiraGestacao}
              onChange={setPrimeiraGestacao}
            />
          </View>

          {/* Pergunta 4 — Select: Única / Gemelar */}
          <View style={styles.card}>
            <Text style={styles.label}>Gestação única ou gemelar?</Text>
            <SelectGroup
              options={["Única", "Gemelar"]}
              selected={tipoGestacao}
              onChange={setTipoGestacao}
            />
          </View>

          {/* Pergunta 5 */}
          <View style={styles.card}>
            <Text style={styles.label}>Qual sua altura? (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={altura}
              onChangeText={setAltura}
              placeholder="Ex: 165"
              placeholderTextColor="#c8a0a8"
            />
            <Text style={[styles.label, { marginTop: 10 }]}>Qual seu peso? (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
              placeholder="Ex: 65"
              placeholderTextColor="#c8a0a8"
            />
          </View>

          {/* Pergunta 6 */}
          <View style={styles.card}>
            <Text style={styles.label}>O que você busca no app?</Text>
            <CheckboxGroup
              options={OBJETIVOS}
              selected={objetivos}
              onChange={setObjetivos}
            />
          </View>

          {/* Pergunta 7 */}
          <View style={styles.card}>
            <Text style={styles.label}>Você possui alguma restrição alimentar?</Text>
            <CheckboxGroup
              options={RESTRICOES}
              selected={restricoes}
              onChange={setRestricoes}
            />
          </View>

          {/* Pergunta 8 */}
          <View style={styles.card}>
            <Text style={styles.label}>Você sente algum desses sintomas?</Text>
            <CheckboxGroup
              options={SINTOMAS}
              selected={sintomas}
              onChange={setSintomas}
            />
          </View>

          {/* Pergunta 9 */}
          <View style={styles.card}>
            <Text style={styles.label}>Você utiliza vitaminas ou suplementos?</Text>
            <TextInput
              style={styles.input}
              value={suplementos}
              onChangeText={setSuplementos}
              placeholder="Descreva ou escreva 'Não'"
              placeholderTextColor="#c8a0a8"
            />
          </View>

          {/* Pergunta 10 */}
          <View style={styles.card}>
            <Text style={styles.label}>
              Você possui alguma doença (diabetes gestacional, hipertensão, anemia, etc)?
            </Text>
            <TextInput
              style={styles.input}
              value={doencas}
              onChangeText={setDoencas}
              placeholder="Descreva ou escreva 'Não'"
              placeholderTextColor="#c8a0a8"
            />
          </View>

          {/* Pergunta 11 — Select: Sim / Não */}
          <View style={styles.card}>
            <Text style={styles.label}>Tem acompanhamento médico ou nutricional?</Text>
            <SelectGroup
              options={["Sim", "Não"]}
              selected={acompanhamento}
              onChange={setAcompanhamento}
            />
          </View>

          {/* Botão */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#f5f0e8" />
            ) : (
              <Text style={styles.btnText}>Concluir</Text>
            )}
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#f8d7da",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#b5405a",
    fontWeight: "700",
    lineHeight: 38,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8d7da",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#d4a0aa",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  card: {
    backgroundColor: "#fdf6f0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e8c8d0",
  },
  label: {
    fontSize: 14,
    color: "#b5405a",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 10,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#d4a0aa",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#3a1a22",
    backgroundColor: "#fff8f5",
  },
  btn: {
    backgroundColor: "#6b7c5c",
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
  btnDisabled: { opacity: 0.7 },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f5f0e8",
    letterSpacing: 0.3,
  },
});