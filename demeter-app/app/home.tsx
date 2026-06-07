// app/home.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
  Animated,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import Navbar from "../components/Navbar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type SemanaInfo = {
  semana_gestacional: number;
  trimestre: number;
  tamanho_feto: string;
  peso_estimado_gramas: number | null;
  tamanho_estimado_cm: number | null;
  desenvolvimento_feto: string;
  mudancas_corpo_mae: string;
  alimentos_recomendados: string[] | null;
  alertas: string[] | null;
  nutrientes_necessarios: string[] | null;
};

function getImagemSemana(semana: number): string {
  const numero = String(semana).padStart(2, "0");
  return `https://kfixoncmpzaeecxygabi.supabase.co/storage/v1/object/public/gestacional-imagens/semanas/semana_${numero}.png`;
}

// ─── Hook carrossel ───────────────────────────────────────────────────────────
function useFrasesLoop(semana: SemanaInfo | null) {
  const [fraseIndex, setFraseIndex] = useState(0);
  const [visivel, setVisivel] = useState(true);

  const frases = semana
    ? [
        `Seu bebê pesa aproximadamente ${
          semana.peso_estimado_gramas != null
            ? semana.peso_estimado_gramas < 1000
              ? semana.peso_estimado_gramas + "g"
              : (semana.peso_estimado_gramas / 1000).toFixed(1) + "kg"
            : "peso ainda não estimado"
        }${
          semana.tamanho_estimado_cm != null
            ? ` e tem entre ${semana.tamanho_estimado_cm - 2} cm e ${semana.tamanho_estimado_cm} cm`
            : ""
        }. Tamanho de um(a) ${semana.tamanho_feto}!`,
        semana.desenvolvimento_feto,
        semana.mudancas_corpo_mae,
      ]
    : [];

  useEffect(() => {
    if (frases.length === 0) return;
    const intervalo = setInterval(() => {
      setVisivel(false);
      setTimeout(() => {
        setFraseIndex((i) => (i + 1) % frases.length);
        setVisivel(true);
      }, 500);
    }, 5500);
    return () => clearInterval(intervalo);
  }, [frases.length]);

  return { frase: frases[fraseIndex] ?? "", visivel, total: frases.length, fraseIndex };
}

// ─── Modal de alertas ─────────────────────────────────────────────────────────
function AlertasModal({
  visible,
  alertas,
  onClose,
}: {
  visible: boolean;
  alertas: string[];
  onClose: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 180,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={modalStyles.overlay}
        onPress={onClose}
      >
        <Animated.View
          style={[
            modalStyles.box,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={modalStyles.titulo}>Alerta!</Text>

          {alertas.map((item, i) => (
            <View key={i} style={modalStyles.alertRow}>
              <Text style={modalStyles.alertIcon}>⚠</Text>
              <Text style={modalStyles.alertText}>{item}</Text>
            </View>
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Tela Encerrada ───────────────────────────────────────────────────────────
function TelaEncerrada({
  status,
  nome,
}: {
  status: "finalizada" | "interrompida";
  nome: string;
}) {
  const router = useRouter();
  const isFinalizada = status === "finalizada";

  async function handleSair() {
    const token = await AsyncStorage.getItem("auth_token");
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem(`status_gestacao_${token}`);
    router.replace("/login" as any);
  }

  async function handleFoiEngano() {
    const token = await AsyncStorage.getItem("auth_token");
    await AsyncStorage.removeItem(`status_gestacao_${token}`);
    router.replace("/maeinfo" as any);
  }

  if (isFinalizada) {
    return (
      <View style={[encStyles.outer, { backgroundColor: ROSA_CLARO }]}>
        <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />
        <ScrollView
          contentContainerStyle={encStyles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={[encStyles.avatarCircle, { borderColor: ROSA_BORDA }]}>
            <Image
              source={require("../assets/images/demeter.png")}
              style={encStyles.avatarImage}
              resizeMode="contain"
            />
          </View>

          {/* Título */}
          <Text style={[encStyles.titulo, { color: ROSA }]}>
            {`Parabéns, mamãe\n${nome}! 🎉`}
          </Text>

          {/* Card única frase */}
          <View style={encStyles.cardFrase}>
            <Text style={[encStyles.cardTexto, { color: TEXTO }]}>
              Que jornada incrível você viveu! Parabéns por cada passo dessa caminhada.
            </Text>
          </View>

          {/* Botões */}
          <TouchableOpacity
              style={[encStyles.btn, { backgroundColor: "#A3B18A" }]}
            onPress={handleSair}
            activeOpacity={0.85}
          >
            <Text style={[encStyles.btnTexto, { color: "#ffffff" }]}>Sair</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[encStyles.btn, { backgroundColor: "rgba(212, 71, 107, 0.76)" }]}
            onPress={handleFoiEngano}
            activeOpacity={0.85}
          >
            <Text style={[encStyles.btnTexto, { color: "#ffffff" }]}>
              Foi um engano
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        <Navbar current="home" />
      </View>
    );
  }

  // ── Interrompida ─────────────────────────────────────────────────────────────
  return (
    <View style={[encStyles.outer, { backgroundColor: "#747474" }]}>
      <StatusBar barStyle="light-content" backgroundColor="#747474" />
      <ScrollView
        contentContainerStyle={encStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar luto */}
        <View style={[encStyles.avatarCircle, { borderColor: "#888888" }]}>
          <Image
            source={require("../assets/images/demeter_luto.png")}
            style={encStyles.avatarImage}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <Text style={[encStyles.titulo, { color: "rgba(0,0,0,0.63)" }]}>
          Estamos com você! 🤍
        </Text>

        {/* Card única frase */}
        <View style={[encStyles.cardFrase, { backgroundColor: "#5E5E5E" }]}>
          <Text style={[encStyles.cardTexto, { color: "#000000" }]}>
            Você não está sozinha. Estamos aqui com você nesse momento difícil.
          </Text>
        </View>

        {/* Botões */}
        <TouchableOpacity
          style={[encStyles.btn, { backgroundColor: "#ffffff" }]}
          onPress={handleSair}
          activeOpacity={0.85}
        >
          <Text style={[encStyles.btnTexto, { color: "#000000" }]}>Sair</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[encStyles.btn, { backgroundColor: "rgba(0, 0, 0, 0.63)" }]}
          onPress={handleFoiEngano}
          activeOpacity={0.85}
        >
          <Text style={[encStyles.btnTexto, { color: "#ffffff" }]}>
            Foi um engano
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Navbar current="home" />
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [semana, setSemana] = useState<SemanaInfo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [statusGestacao, setStatusGestacao] = useState<"finalizada" | "interrompida" | null>(null);
  const [nomeMae, setNomeMae] = useState<string>("");
  const [alertasVisivel, setAlertasVisivel] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const { frase, visivel, total, fraseIndex } = useFrasesLoop(semana);

  useEffect(() => {
    if (!visivel) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: -10, duration: 400, useNativeDriver: true }),
      ]).start();
    } else {
      translateAnim.setValue(10);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visivel]);

  useFocusEffect(
    useCallback(() => {
      async function verificarStatus() {
        const token = await AsyncStorage.getItem("auth_token");
        const status = await AsyncStorage.getItem(`status_gestacao_${token}`);
        if (status === "finalizada" || status === "interrompida") {
          // Busca o nome da mãe
          try {
            const response = await fetch(`${API_URL}/api/mae/info`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            });
            const json = await response.json();
            setNomeMae(json?.nome ?? "");
          } catch {
            setNomeMae("");
          }
          setStatusGestacao(status as "finalizada" | "interrompida");
          setCarregando(false);
        } else {
          setStatusGestacao(null);
          carregar();
        }
      }
      verificarStatus();
    }, [])
  );

  async function carregar() {
    try {
      setCarregando(true);
      setErro(null);
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${API_URL}/api/semanas-gestacionais/minha-semana`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const json = await response.json();
      if (!response.ok) throw new Error("Erro ao buscar semana.");
      setSemana(json.data ?? json);
    } catch (e) {
      setErro("Não foi possível carregar os dados da semana.");
    } finally {
      setCarregando(false);
    }
  }

  // ── Tela encerrada ─────────────────────────────────────────────────────────
  if (statusGestacao) {
    return <TelaEncerrada status={statusGestacao} nome={nomeMae} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />

      {semana?.alertas && (
        <AlertasModal
          visible={alertasVisivel}
          alertas={semana.alertas}
          onClose={() => setAlertasVisivel(false)}
        />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Loading ── */}
        {carregando && (
          <View style={styles.centralizador}>
            <ActivityIndicator size="large" color={ROSA} />
            <Text style={styles.textoCarregando}>Carregando sua semana...</Text>
          </View>
        )}

        {/* ── Erro ── */}
        {erro && !carregando && (
          <View style={styles.centralizador}>
            <Text style={styles.textoErro}>{erro}</Text>
          </View>
        )}

        {/* ── Conteúdo ── */}
        {semana && !carregando && (
          <>
            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  style={styles.alertaBtn}
                  onPress={() => setAlertasVisivel(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.alertaBtnTexto}>!</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.tituloSemana}>
                Semana {semana.semana_gestacional}
              </Text>

              <View style={styles.headerRight}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require("../assets/images/demeter.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>

            {/* ── Hero ── */}
            <View style={styles.heroCircleWrap}>
              <View style={styles.heroCircle}>
                <Image
                  source={{ uri: getImagemSemana(semana.semana_gestacional) }}
                  style={styles.imagemSemana}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* ── Carrossel ── */}
            <Animated.Text
              style={[
                styles.heroDesc,
                { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
              ]}
            >
              {frase}
            </Animated.Text>

            <View style={styles.dotsContainer}>
              {Array.from({ length: total }).map((_, i) => (
                <View key={i} style={[styles.dot, i === fraseIndex && styles.dotAtivo]} />
              ))}
            </View>

            {/* ── Informações importantes ── */}
            <View style={styles.card}>
              <View style={styles.cardTituloWrap}>
                <Text style={styles.cardTitulo}>Informações importantes</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.starIcon}>★</Text>
                <View style={styles.infoTextoWrap}>
                  <Text style={styles.infoLabel}>
                    Possíveis sintomas que você pode estar sentindo:
                  </Text>
                  <Text style={styles.infoTexto}>{semana.mudancas_corpo_mae}</Text>
                </View>
              </View>

              {semana.nutrientes_necessarios && semana.nutrientes_necessarios.length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.starIcon}>★</Text>
                  <View style={styles.infoTextoWrap}>
                    <Text style={styles.infoLabel}>
                      Nutrientes que você mais precisa nessa semana:
                    </Text>
                    <Text style={styles.infoTexto}>
                      {semana.nutrientes_necessarios.join(", ")}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* ── Alimentos ── */}
            {semana.alimentos_recomendados && semana.alimentos_recomendados.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitulo}>
                  Alimentos importantes para consumir nessa semana:
                </Text>
                <View style={styles.alimentosRow}>
                  {semana.alimentos_recomendados.map((item, i) => (
                    <Text key={i} style={styles.alimentoItem}>★ {item}</Text>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Navbar current="home" />
    </View>
  );
}

// ─── Cores ────────────────────────────────────────────────────────────────────
const ROSA         = "#b5405a";
const ROSA_CLARO   = "#fce8ed";
const ROSA_BORDA   = "#e8b0be";
const ROSA_CIRCULO = "#e8a0b0";
const CREME_CARD   = "#ffffff";
const TEXTO        = "#9a6070";
const SUAVE        = "#d4849a";
const VERDE        = "#6b7c5c";
const CINZA_BG     = "#6b6b6b";
const CINZA_CARD   = "#555555";

// ─── Estilos tela encerrada ───────────────────────────────────────────────────
const encStyles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 120,
    paddingBottom: 20,
  },
  avatarCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "transparent",
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 2,
  },
  avatarImage: {
    width: "180%",
    height: "180%",
    position: "absolute",
    top: "-40%",
    left: "-40%",
  },
  titulo: {
    fontSize: 24,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 32,
  },
  // Card com dimensões 339x137 e sombra para destaque
  cardFrase: {
    width: 339,
    height: 137,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  cardTexto: {
    fontSize: 20,
    textAlign: "center",
    lineHeight: 23,
    fontFamily: "serif",
  },
  // Botões com dimensões 307x69
  btn: {
    width: 170,
    height: 47,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  btnTexto: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#ffffff",
  },
});

// ─── Estilos tela principal ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },

  centralizador: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  textoCarregando: { marginTop: 12, color: SUAVE, fontSize: 15 },
  textoErro: { color: ROSA, fontSize: 15, textAlign: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerLeft: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    paddingBottom: 0,
    paddingTop: 10,
  },
  headerRight: {
    width: 44,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingBottom: 0,
    paddingTop: 10,
  },
  alertaBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ROSA,
    alignItems: "center",
    justifyContent: "center",
  },
  alertaBtnTexto: { color: ROSA, fontSize: 18, fontWeight: "700", lineHeight: 22 },
  tituloSemana: {
    fontSize: 22,
    fontFamily: "serif",
    fontWeight: "700",
    color: ROSA,
    textAlign: "center",
    flex: 1,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ROSA_CLARO,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
  },
  logoImage: {
    width: "180%",
    height: "180%",
    position: "absolute",
    top: "-40%",
    left: "-40%",
  },

  heroCircleWrap: { alignItems: "center", paddingVertical: 16 },
  heroCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: ROSA_CIRCULO,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imagemSemana: { width: 175, height: 175 },

  heroDesc: {
    textAlign: "center",
    paddingHorizontal: 28,
    color: ROSA,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    minHeight: 66,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ROSA_BORDA },
  dotAtivo: { backgroundColor: ROSA },

  card: {
    backgroundColor: CREME_CARD,
    borderRadius: 20,
    padding: 18,
    paddingTop: 8,
    marginBottom: 14,
    shadowColor: "#c47a8a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTituloWrap: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginBottom: 18,
    marginTop: -30,
    shadowColor: "#c47a8a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitulo: {
    fontSize: 20,
    fontFamily: "serif",
    fontWeight: "700",
    color: ROSA,
    textAlign: "center",
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  infoTextoWrap: { flex: 1 },
  infoLabel: { fontSize: 18, fontWeight: "700", color: ROSA, marginBottom: 4 },
  infoTexto: { fontSize: 16, color: TEXTO, lineHeight: 20 },
  starIcon: { color: ROSA, fontSize: 16, marginTop: 1 },

  alimentosRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 4 },
  alimentoItem: { fontSize: 14, color: ROSA, fontWeight: "600" },
});

// ─── Modal alertas ────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  box: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    width: 300,
    alignItems: "center",
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ff6666",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "serif",
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    width: "100%",
  },
  alertIcon: {
    color: "#ff6666",
    fontSize: 18,
    marginRight: 8,
  },
  alertText: {
    color: "#ff6666",
    fontSize: 14,
    fontFamily: "serif",
    textAlign: "center",
    flexShrink: 1,
  },
});