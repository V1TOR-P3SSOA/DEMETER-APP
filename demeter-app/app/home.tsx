// app/home.tsx
import React, { useEffect, useState } from "react";
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
import Navbar from "../components/Navbar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Tipos ────────────────────────────────────────────────────────────────────
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

// ─── URL da imagem por semana ─────────────────────────────────────────────────
function getImagemSemana(semana: number): string {
  const numero = String(semana).padStart(2, "0");
  return `https://kfixoncmpzaeecxygabi.supabase.co/storage/v1/object/public/gestacional-imagens/semanas/semana_${numero}.webp`;
}

// ─── Tela ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [semana, setSemana] = useState<SemanaInfo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
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

    carregar();
  }, []);

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
            {/* Semana e trimestre */}
            <Text style={styles.tituloSemana}>
              Semana {semana.semana_gestacional}
            </Text>
            <Text style={styles.trimestre}>
              {semana.trimestre}º Trimestre
            </Text>

            {/* Tamanho do bebê */}
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
                <Text style={styles.cardTexto}>
                  📏 {semana.tamanho_estimado_cm} cm
                </Text>
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

            {/* Desenvolvimento do feto */}
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>🌱 Desenvolvimento</Text>
              <Text style={styles.cardTexto}>{semana.desenvolvimento_feto}</Text>
            </View>

            {/* Mudanças no corpo da mãe */}
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>🤰 Seu corpo essa semana</Text>
              <Text style={styles.cardTexto}>{semana.mudancas_corpo_mae}</Text>
            </View>

            {/* Nutrientes */}
            {semana.nutrientes_necessarios &&
              semana.nutrientes_necessarios.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitulo}>💊 Nutrientes importantes</Text>
                  {(semana.nutrientes_necessarios || []).map((item, i) => (
                    <Text key={i} style={styles.listaItem}>
                      • {item}
                    </Text>
                  ))}
                </View>
              )}

            {/* Alimentos recomendados */}
            {semana.alimentos_recomendados &&
              semana.alimentos_recomendados.length > 0 && (
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

            {/* Alertas */}
            {semana.alertas && semana.alertas.length > 0 && (
              <View style={[styles.card, styles.cardAlerta]}>
                <Text style={styles.cardTitulo}>⚠️ Alertas da semana</Text>
                {(semana.alertas || []).map((item, i) => (
                  <Text key={i} style={styles.listaItem}>
                    • {item}
                  </Text>
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

// ─── Estilos ──────────────────────────────────────────────────────────────────

const ROSA       = "#b5405a";
const ROSA_CLARO = "#f8d7da";
const ROSA_BORDA = "#e8c8d0";
const CREME_CARD = "#f0ead8";
const TEXTO      = "#3a1a22";
const SUAVE      = "#a07080";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROSA_CLARO,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── Loading / Erro
  centralizador: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
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
  },

  // ── Cabeçalho
  tituloSemana: {
    fontSize: 32,
    fontFamily: "serif",
    fontWeight: "700",
    color: ROSA,
    textAlign: "center",
    marginBottom: 4,
  },
  trimestre: {
    fontSize: 15,
    color: SUAVE,
    textAlign: "center",
    marginBottom: 24,
  },

  // ── Cards
  card: {
    backgroundColor: CREME_CARD,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: ROSA_BORDA,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAlerta: {
    borderColor: "#e8b04a",
    backgroundColor: "#fdf6e4",
  },
  cardTitulo: {
    fontSize: 15,
    fontFamily: "serif",
    fontWeight: "700",
    color: ROSA,
    marginBottom: 10,
  },
  cardTexto: {
    fontSize: 14,
    color: TEXTO,
    lineHeight: 21,
    marginBottom: 4,
  },
  destaque: {
    fontWeight: "700",
    color: ROSA,
  },

  // ── Imagem da semana
  imagemSemana: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },

  // ── Lista com bullets
  listaItem: {
    fontSize: 14,
    color: TEXTO,
    lineHeight: 22,
    marginBottom: 2,
  },

  // ── Tags (alimentos)
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
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
});