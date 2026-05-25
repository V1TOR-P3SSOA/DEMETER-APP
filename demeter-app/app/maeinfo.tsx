// app/maeinfo.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Tipos ────────────────────────────────────────────────────────────────────
type MaeInfo = {
  nome: string;
  idade: number;
  peso_kg: number;
  altura_cm: number;
  imc: number;
  classificacao_imc: string;
  trimestre: number;
  agua_recomendada_litros: number;
  doencas: string | null;
  restricoes_alimentares: string[] | null;
};

// ─── Busca dados da mãe ───────────────────────────────────────────────────────
async function fetchMaeInfo(): Promise<MaeInfo> {
  const token = await AsyncStorage.getItem("auth_token");
  const response = await fetch(`${API_URL}/api/mae/info`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) throw new Error("Erro ao buscar informações.");
  return response.json();
}

// ─── Modal de status (finalizada / interrompida) ──────────────────────────────
function StatusModal({
  visible,
  tipo,
  onClose,
}: {
  visible: boolean;
  tipo: "finalizada" | "interrompida" | null;
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

  const conteudo =
    tipo === "finalizada"
      ? {
          emoji: "🎉",
          titulo: "Parabéns!",
          texto:
            "Que momento incrível! Sua jornada de gestação chegou ao fim. Desejamos toda saúde e felicidade para você e seu bebê!",
          corIcone: "#6b7c5c",
        }
      : {
          emoji: "🤍",
          titulo: "Meus pêsames...",
          texto:
            "Sentimos muito pelo que você está passando. Você não está sozinha. Cuide-se com muito carinho.",
          corIcone: "#a0a0a0",
        };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={modal.overlay}>
        <Animated.View
          style={[
            modal.box,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View
            style={[modal.iconCircle, { backgroundColor: conteudo.corIcone }]}
          >
            <Text style={modal.iconEmoji}>{conteudo.emoji}</Text>
          </View>
          <Text style={modal.titulo}>{conteudo.titulo}</Text>
          <Text style={modal.texto}>{conteudo.texto}</Text>
          <TouchableOpacity
            style={modal.btn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={modal.btnTexto}>Fechar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function MaeInfoScreen() {
  const router = useRouter();

  const [dados, setDados] = useState<MaeInfo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
const [modalTipo, setModalTipo] = useState<"finalizada" | "interrompida" | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro(null);
      const info = await fetchMaeInfo();
      setDados(info);

      // Animação de entrada igual ao login
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
    } catch {
      setErro("Não foi possível carregar suas informações.");
    } finally {
      setCarregando(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <View style={styles.centralizador}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />
        <ActivityIndicator size="large" color="#b5405a" />
        <Text style={styles.textoCarregando}>
          Carregando suas informações...
        </Text>
      </View>
    );
  }

  // ── Erro ───────────────────────────────────────────────────────────────────
  if (erro || !dados) {
    return (
      <View style={styles.centralizador}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />
        <Text style={styles.textoErro}>{erro}</Text>
        <TouchableOpacity
          style={styles.btnTentar}
          onPress={carregarDados}
          activeOpacity={0.85}
        >
          <Text style={styles.btnTentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Tela ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.outer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />

      <StatusModal
        visible={modalTipo !== null}
        tipo={modalTipo}
        onClose={() => setModalTipo(null)}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── Avatar + título ── */}
          <View style={styles.avatarCircle}>
            <Image
              source={require("../assets/images/demeter.png")}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.tituloPagina}>Minhas Informações</Text>
          <Text style={styles.subtitulo}>Olá, {dados.nome} 💗</Text>

          {/* ── Card: Dados pessoais ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Dados Pessoais</Text>

            <View style={styles.linha}>
              <Text style={styles.rotulo}>Nome</Text>
              <Text style={styles.valor}>{dados.nome}</Text>
            </View>
            <View style={styles.divisor} />

            <View style={styles.linha}>
              <Text style={styles.rotulo}>Idade</Text>
              <Text style={styles.valor}>{dados.idade} anos</Text>
            </View>
            <View style={styles.divisor} />

            <View style={styles.linha}>
              <Text style={styles.rotulo}>Trimestre</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>
                  {dados.trimestre}º Trimestre
                </Text>
              </View>
            </View>
          </View>

          {/* ── Card: Métricas ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Métricas Corporais</Text>

            {/* Peso e Altura em grid */}
            <View style={styles.gridMetricas}>
              <View style={styles.metricaItem}>
                <Text style={styles.metricaValor}>{dados.peso_kg}</Text>
                <Text style={styles.metricaUnidade}>kg</Text>
                <Text style={styles.metricaRotulo}>Peso</Text>
              </View>
              <View style={styles.metricaSeparador} />
              <View style={styles.metricaItem}>
                <Text style={styles.metricaValor}>{dados.altura_cm}</Text>
                <Text style={styles.metricaUnidade}>cm</Text>
                <Text style={styles.metricaRotulo}>Altura</Text>
              </View>
            </View>

            <View style={styles.divisor} />

            {/* IMC */}
            <View style={styles.linha}>
              <View>
                <Text style={styles.rotulo}>IMC</Text>
                <Text style={styles.metricaDestaque}>{dados.imc}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>
                  {dados.classificacao_imc}
                </Text>
              </View>
            </View>

            <View style={styles.divisor} />

            {/* Água */}
            <View>
              <Text style={styles.rotulo}>💧 Água recomendada por dia</Text>
              <Text style={styles.aguaValor}>
                {dados.agua_recomendada_litros} litros
              </Text>
            </View>
          </View>

          {/* ── Card: Saúde (só aparece se tiver dado) ── */}
          {(dados.doencas ||
            (dados.restricoes_alimentares &&
              dados.restricoes_alimentares.length > 0)) && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Saúde</Text>

              {dados.doencas && (
                <>
                  <Text style={styles.rotulo}>Doenças / Condições</Text>
                  <Text style={styles.textoSaude}>{dados.doencas}</Text>
                </>
              )}

              {dados.restricoes_alimentares &&
                dados.restricoes_alimentares.length > 0 && (
                  <>
                    {dados.doencas && <View style={styles.divisor} />}
                    <Text style={styles.rotulo}>Restrições Alimentares</Text>
                    <View style={styles.tagsContainer}>
                      {dados.restricoes_alimentares.map((item, i) => (
                        <View key={i} style={styles.tag}>
                          <Text style={styles.tagTexto}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
            </View>
          )}

          {/* ── Botões de status ── */}
          <Text style={styles.labelBotoes}>
            Atualizar status da gestação:
          </Text>

          <TouchableOpacity
            style={[styles.btn, styles.btnFinalizada]}
            onPress={() => setModalTipo("finalizada")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnTexto}>🎉  Gravidez Finalizada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnInterrompida]}
            onPress={() => setModalTipo("interrompida")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnTexto}>🤍  Gravidez Interrompida</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const ROSA       = "#b5405a";
const ROSA_CLARO = "#f8d7da";
const ROSA_BORDA = "#e8c8d0";
const CREME      = "#f5f0e8";
const CREME_CARD = "#f0ead8";
const TEXTO      = "#3a1a22";
const SUAVE      = "#a07080";
const VERDE      = "#6b7c5c";
const CINZA      = "#a0a0a0";

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: ROSA_CLARO,
  },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },

  container: {
    width: "100%",
    alignItems: "center",
  },

  // ── Centralização loading/erro
  centralizador: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ROSA_CLARO,
    padding: 24,
  },
  textoCarregando: {
    marginTop: 12,
    color: SUAVE,
    fontSize: 15,
  },
  textoErro: {
    color: ROSA,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  btnTentar: {
    backgroundColor: ROSA,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  btnTentarTexto: {
    color: CREME,
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Avatar
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ROSA_CLARO,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: ROSA_BORDA,
  },
  avatarImage: {
    width: "180%",
    height: "180%",
    position: "absolute",
    top: "-40%",
    left: "-40%",
  },

  // ── Cabeçalho
  tituloPagina: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: ROSA,
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  subtitulo: {
    fontSize: 15,
    color: SUAVE,
    marginBottom: 28,
  },

  // ── Card
  card: {
    width: "100%",
    backgroundColor: CREME_CARD,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitulo: {
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontWeight: "700",
    color: ROSA,
    marginBottom: 16,
  },

  // ── Linha label/valor
  linha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  rotulo: {
    fontSize: 13,
    color: SUAVE,
  },
  valor: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXTO,
  },
  divisor: {
    height: 1,
    backgroundColor: ROSA_BORDA,
    marginVertical: 10,
  },

  // ── Badge (trimestre, IMC)
  badge: {
    backgroundColor: ROSA_CLARO,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: ROSA_BORDA,
  },
  badgeTexto: {
    fontSize: 13,
    color: ROSA,
    fontWeight: "600",
  },

  // ── Grid peso/altura
  gridMetricas: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 4,
  },
  metricaItem: {
    alignItems: "center",
    flex: 1,
  },
  metricaValor: {
    fontSize: 26,
    fontWeight: "700",
    color: ROSA,
  },
  metricaUnidade: {
    fontSize: 13,
    color: SUAVE,
    marginTop: -2,
  },
  metricaRotulo: {
    fontSize: 12,
    color: SUAVE,
    marginTop: 4,
  },
  metricaSeparador: {
    width: 1,
    height: 44,
    backgroundColor: ROSA_BORDA,
  },
  metricaDestaque: {
    fontSize: 26,
    fontWeight: "700",
    color: ROSA,
    marginTop: 2,
  },

  // ── Água
  aguaValor: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4a90d9",
    marginTop: 4,
  },

  // ── Saúde
  textoSaude: {
    fontSize: 14,
    color: TEXTO,
    marginTop: 6,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: ROSA_CLARO,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: ROSA_BORDA,
  },
  tagTexto: {
    fontSize: 13,
    color: ROSA,
    fontWeight: "500",
  },

  // ── Botões status
  labelBotoes: {
    fontSize: 13,
    color: SUAVE,
    marginBottom: 12,
    marginTop: 4,
  },
  btn: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnFinalizada: {
    backgroundColor: VERDE,
    shadowColor: "#3a4a2c",
  },
  btnInterrompida: {
    backgroundColor: CINZA,
    shadowColor: "#333",
  },
  btnTexto: {
    fontSize: 15,
    fontWeight: "700",
    color: CREME,
    letterSpacing: 0.3,
  },
});

// ─── Estilos do modal ─────────────────────────────────────────────────────────
const modal = StyleSheet.create({
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
    borderColor: ROSA_BORDA,
    shadowColor: "#3a1a22",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconEmoji: {
    fontSize: 30,
  },
  titulo: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontWeight: "700",
    color: ROSA,
    marginBottom: 10,
    textAlign: "center",
  },
  texto: {
    fontSize: 14,
    color: TEXTO,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: ROSA,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  btnTexto: {
    color: CREME,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});