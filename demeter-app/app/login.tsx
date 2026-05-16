// app/login.jsx
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
  Alert,
  StatusBar,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// ─── Configuração da API ──────────────────────────────────────────────────────
// Troque pelo IP local da sua máquina (ex: 192.168.1.10) ao usar Expo Go físico
// Para emulador Android: http://10.0.2.2:8000
// Para iOS Simulator:   http://localhost:8000
const API_URL = process.env.EXPO_PUBLIC_API_URL; // ← ALTERE AQUI

async function loginRequest(email: string, password: string) {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Credenciais inválidas.");
  }

  return response.json();
}
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await loginRequest(email.trim(), password);
      router.replace("/home" as any); // troque pela sua rota principal quando criar
    } catch (err: any) {
      Alert.alert("Erro ao entrar", err.message);
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Ilustração circular da Deméter */}
          <View style={styles.avatarCircle}>
            <Image
              source={require("../assets/images/demeter.png")}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          {/* Título */}
          <Text style={styles.title}>Login</Text>

          {/* Card */}
          <View style={styles.card}>
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

            <Text style={styles.registerText}>
              Não tem uma conta?{" "}
              <Text
                style={styles.registerLink}
                onPress={() => router.push("/register" as any)}
              >
                Cadastre-se.
              </Text>
            </Text>
          </View>

          {/* Botão */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#f5f0e8" />
            ) : (
              <Text style={styles.btnText}>Entrar na plataforma</Text>
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
    backgroundColor: "#f5f0e8",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 28,
  },
  container: {
    width: "100%",
    alignItems: "center",
  },
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
  registerText: {
    fontSize: 12,
    color: "#b5405a",
    marginTop: 4,
    textAlign: "center",
  },
  registerLink: {
    color: "#4a90d9",
    textDecorationLine: "underline",
  },
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
  btnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f5f0e8",
    letterSpacing: 0.3,
  },
});