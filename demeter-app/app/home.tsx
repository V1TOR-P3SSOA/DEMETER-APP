// app/home.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
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
  return `https://kfixoncmpzaeecxygabi.supabase.co/storage/v1/object/public/gestacional-imagens/semanas/semana_${numero}.webp`;
}

// ─── Mensagens de carinho ─────────────────────────────────────────────────────
const MENSAGENS_INTERROMPIDA = [
  "Você não está sozinha. 🤍",
  "Permita-se sentir. Cuidar de si mesma é um ato de amor.",
  "Cada momento vivido foi único e especial.",
  "Estamos aqui com você nesse momento difícil.",
  "Sua força é maior do que você imagina. 💗",
];

const MENSAGENS_FINALIZADA = [
  "Que jornada incrível você viveu! 🎉",
  "Parabéns por cada passo dessa caminhada.",
  "Um novo capítulo começa agora. 🌸",
  "Você foi incrível durante toda essa jornada!",
  "Desejamos toda a felicidade do mundo para você e seu bebê. 💛",
];

export default function HomeScreen() {
  const [semana, setSemana] = useState<SemanaInfo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [statusGestacao, setStatusGestacao] = useState<"finalizada" | "interrompida" | null>(null);

  // useFocusEffect para re-verificar status toda vez que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      async function verificarStatus() {
        const token = await AsyncStorage.getItem("auth_token");
        const status = await AsyncStorage.getItem(`status_gestacao_${token}`);

        if (status === "finalizada" || status === "interrompida") {
          setStatusGestacao(status);
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

  // ── Tela de gestação encerrada ─────────────────────────────────────────────
  if (statusGestacao) {
    const mensagens = statusGestacao === "finalizada"
      ? MENSAGENS_FINALIZADA
      : MENSAGENS_INTERROMPIDA;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />
        <ScrollView
          contentContainerStyle={styles.scrollEncerrado}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.emojiEncerrado}>
            {statusGestacao === "finalizada" ? "🎉" : "🤍"}
          </Text>
          <Text style={styles.tituloEncerrado}>
            {statusGestacao === "finalizada"
              ? "Parabéns, mamãe!"
              : "Estamos com você"}
          </Text>
          {mensagens.map((msg, i) => (
            <View key={i} style={styles.cardMensagem}>
              <Text style={styles.textoMensagem}>{msg}</Text>
            </View>
          ))}
        </ScrollView>
        <Navbar current="home" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8d7da" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Loading ── */}
        {carregando && (
          <View style={styles.centralizador}>
            <ActivityIndicator size="large" color="#b5405a" />
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
            <Text style={styles.tituloSemana}>
              Semana {semana.semana_gestacional}
            </Text>
            <Text style={styles.trimestre}>
              {semana.trimestre}º Trimestre
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitulo}>👶 Seu bebê agora</Text>
              <Image
                source={{ uri: getImagemSemana(semana.semana_gestacional) }}
                style={styles.imagemSemana}
                resizeMode="contain"
              />
              <Text style={styles.cardTexto}>
                Tamanho de um(a){" "}
                <Text style={styles.destaque}>{semana.tamanho_feto}</Text>
              </Text>
              {semana.tamanho_estimado_cm != null && (
                <Text style={styles.cardTexto}>📏 {semana.tamanho_estimado_cm} cm</Text>
              )}
              {semana.peso_estimado_gramas != null && (
                <Text style={styles.cardTexto}>
                  ⚖️{" "}
                  {semana.peso_estimado_gramas < 1000
                    ? `${semana.peso_estimado_gramas} g`
                    : `${(semana.peso_estimado_gramas / 1000).toFixed(1)} kg`}
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitulo}>🌱 Desenvolvimento</Text>
              <Text style={styles.cardTexto}>{semana.desenvolvimento_feto}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitulo}>🤰 Seu corpo essa semana</Text>
              <Text style={styles.cardTexto}>{semana.mudancas_corpo_mae}</Text>
            </View>

            {semana.nutrientes_necessarios && semana.nutrientes_necessarios.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitulo}>💊 Nutrientes importantes</Text>
                {(semana.nutrientes_necessarios || []).map((item, i) => (
                  <Text key={i} style={styles.listaItem}>• {item}</Text>
                ))}
              </View>
            )}

            {semana.alimentos_recomendados && semana.alimentos_recomendados.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitulo}>🥗 Alimentos recomendados</Text>
                <View style={styles.tagsContainer}>
                  {(semana.alimentos_recomendados || []).map((item, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagTexto}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {semana.alertas && semana.alertas.length > 0 && (
              <View style={[styles.card, styles.cardAlerta]}>
                <Text style={styles.cardTitulo}>⚠️ Alertas da semana</Text>
                {(semana.alertas || []).map((item, i) => (
                  <Text key={i} style={styles.listaItem}>• {item}</Text>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Navbar current="home" />
    </View>
  );
}

const ROSA       = "#b5405a";
const ROSA_CLARO = "#f8d7da";
const ROSA_BORDA = "#e8c8d0";
const CREME_CARD = "#f0ead8";
const TEXTO      = "#3a1a22";
const SUAVE      = "#a07080";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ROSA_CLARO },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // ── Loading / Erro
  centralizador: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  textoCarregando: { marginTop: 12, color: SUAVE, fontSize: 15 },
  textoErro: { color: ROSA, fontSize: 15, textAlign: "center" },

  // ── Cabeçalho
  tituloSemana: { fontSize: 32, fontFamily: "serif", fontWeight: "700", color: ROSA, textAlign: "center", marginBottom: 4 },
  trimestre: { fontSize: 15, color: SUAVE, textAlign: "center", marginBottom: 24 },

  // ── Cards
  card: { backgroundColor: CREME_CARD, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1.5, borderColor: ROSA_BORDA, shadowColor: ROSA, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardAlerta: { borderColor: "#e8b04a", backgroundColor: "#fdf6e4" },
  cardTitulo: { fontSize: 15, fontFamily: "serif", fontWeight: "700", color: ROSA, marginBottom: 10 },
  cardTexto: { fontSize: 14, color: TEXTO, lineHeight: 21, marginBottom: 4 },
  destaque: { fontWeight: "700", color: ROSA },
  imagemSemana: { width: "100%", height: 200, borderRadius: 12, marginBottom: 12 },
  listaItem: { fontSize: 14, color: TEXTO, lineHeight: 22, marginBottom: 2 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  tag: { backgroundColor: ROSA_CLARO, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: ROSA_BORDA },
  tagTexto: { fontSize: 13, color: ROSA, fontWeight: "500" },

  // ── Tela encerrada
  scrollEncerrado: { flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingVertical: 60, paddingBottom: 100 },
  emojiEncerrado: { fontSize: 64, marginBottom: 16 },
  tituloEncerrado: { fontSize: 26, fontFamily: "serif", fontWeight: "700", color: ROSA, marginBottom: 28, textAlign: "center" },
  cardMensagem: { width: "100%", backgroundColor: CREME_CARD, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1.5, borderColor: ROSA_BORDA, alignItems: "center" },
  textoMensagem: { fontSize: 15, color: TEXTO, textAlign: "center", lineHeight: 22, fontFamily: "serif" },
});