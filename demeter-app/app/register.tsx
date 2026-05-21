// app/register.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function registerRequest(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
    }),
  });

  if (response.ok) {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return data.token ?? null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  // Erros de validação (422) vêm em data.errors
  if (data.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat().map(String);
    throw { messages };
  }

  throw { messages: [data.message || "Erro ao cadastrar."] };
}

// ─── Modal de alerta customizado ─────────────────────────────────────────────
function CustomAlert({
  visible,
  title,
  messages,
  onClose,
}: {
  visible: boolean;
  title: string;
  messages: string[];
  onClose: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 200,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const isError = title.toLowerCase().includes("erro");

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={al.overlay}>
        <Animated.View
          style={[al.box, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <View style={[al.iconCircle, isError ? al.iconCircleError : al.iconCircleWarn]}>
            <Text style={al.iconText}>{isError ? "✕" : "!"}</Text>
          </View>
          <Text style={al.title}>{title}</Text>
          {messages.map((msg, i) => (
            <Text key={i} style={al.message}>{msg}</Text>
          ))}
          <TouchableOpacity style={al.btn} onPress={onClose} activeOpacity={0.8}>
            <Text style={al.btnText}>Entendi</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const al = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(58, 26, 34, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  box: {
    backgroundColor: "#fdf6f0",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e8c8d0",
    shadowColor: "#3a1a22",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconCircleError: { backgroundColor: "#b5405a" },
  iconCircleWarn: { backgroundColor: "#c97a40" },
  iconText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  title: {
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontWeight: "700",
    color: "#b5405a",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#3a1a22",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 6,
  },
  btn: {
    marginTop: 18,
    backgroundColor: "#b5405a",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
});
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ title: string; messages: string[] } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const showAlert = (title: string, messages: string[]) => setAlertInfo({ title, messages });
  const closeAlert = () => setAlertInfo(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showAlert("Atenção", ["Preencha todos os campos."]);
      return;
    }
    setLoading(true);
    try {
      const token = await registerRequest(name.trim(), email.trim(), password);
      if (token) {
        await AsyncStorage.setItem("auth_token", token);
      }
      router.replace("/formulario" as any);
    } catch (err: any) {
      showAlert("Erro ao cadastrar", err.messages ?? ["Ocorreu um erro inesperado."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f5f0e8" />

      <CustomAlert
        visible={!!alertInfo}
        title={alertInfo?.title ?? ""}
        messages={alertInfo?.messages ?? []}
        onClose={closeAlert}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.avatarCircle}>
            <Image
              source={require("../assets/images/demeter.png")}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Cadastro</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Nome:</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Senha:</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.loginText}>
              Já tem uma conta?{" "}
              <Text style={styles.loginLink} onPress={() => router.push("/login" as any)}>
                Entre aqui.
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#f5f0e8" />
            ) : (
              <Text style={styles.btnText}>Cadastrar-se</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#f5f0e8" },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 28,
  },
  container: { width: "100%", alignItems: "center" },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#f8d7da",
    overflow: "hidden",
    marginBottom: 16,
  },
  avatarImage: {
    width: "180%",
    height: "180%",
    position: "absolute",
    top: "-40%",
    left: "-40%",
  },
  title: {
    fontSize: 36,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#b5405a",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  card: {
    width: "100%",
    backgroundColor: "#f0ead8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#b5405a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: "#b5405a",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#d4a0aa",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#3a1a22",
    backgroundColor: "#fdf6f0",
    marginBottom: 14,
  },
  loginText: { fontSize: 12, color: "#b5405a", marginTop: 4, textAlign: "center" },
  loginLink: { color: "#4a90d9", textDecorationLine: "underline" },
  btn: {
    width: "100%",
    backgroundColor: "#6b7c5c",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#3a4a2c",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 15, fontWeight: "700", color: "#f5f0e8", letterSpacing: 0.3 },
});