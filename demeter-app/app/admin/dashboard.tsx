// app/admin/index.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import AdminNavbar from "../../components/Adminnavbar";
import Svg, { Path, Circle } from "react-native-svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Cores ────────────────────────────────────────────────────────────────────
const ROSA       = "#b5405a";
const ROSA_CLARO = "#F7D7D8";   // <- cor atualizada
const ROSA_CARD  = "#fdf0f3";
const ROSA_BORDA = "#e8b0be";
const SUAVE      = "#9a7080";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Stats = {
  total_usuarios: number;
  novos_essa_semana: number;
  sem_questionario: number;
  total_questionarios: number;
  questionarios_preenchidos: number;
  questionarios_pendentes: number;
  total_artigos: number;
  artigos_recentes: number;
  artigos_esse_mes: number;
};

type CadastroRecente = {
  id: number;
  name: string;
  email: string;
  foto_url?: string;
  created_at: string;
};

type CadastroSemana = {
  semana: string;
  total: number;
};

// ─── Helper: busca autenticada ────────────────────────────────────────────────
async function apiFetch(path: string) {
  const token = await AsyncStorage.getItem("auth_token");
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

// ─── Helper: tempo relativo ───────────────────────────────────────────────────
function tempoRelativo(dateStr: string): string {
  const diffDias = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDias === 0) return "hoje";
  if (diffDias === 1) return "há 1 dia";
  if (diffDias < 7) return `há ${diffDias} dias`;
  const s = Math.floor(diffDias / 7);
  return s === 1 ? "há 1 semana" : `há ${s} semanas`;
}

// ─── Ícones SVG ───────────────────────────────────────────────────────────────
function IconUsuarios() {
  return (
    <Svg width={28} height={28} viewBox="0 0 25 25" fill="none">
      <Path
        d="M17.7084 21.875V19.7917C17.7084 18.6866 17.2694 17.6268 16.488 16.8454C15.7066 16.064 14.6468 15.625 13.5417 15.625H5.20841C4.10335 15.625 3.04354 16.064 2.26214 16.8454C1.48073 17.6268 1.04175 18.6866 1.04175 19.7917V21.875M23.9584 21.875V19.7917C23.9577 18.8685 23.6505 17.9716 23.0848 17.242C22.5192 16.5124 21.7273 15.9912 20.8334 15.7604M16.6667 3.26042C17.563 3.4899 18.3574 4.01115 18.9247 4.74199C19.492 5.47283 19.7999 6.3717 19.7999 7.29687C19.7999 8.22205 19.492 9.12092 18.9247 9.85176C18.3574 10.5826 17.563 11.1039 16.6667 11.3333M13.5417 7.29167C13.5417 9.59285 11.6763 11.4583 9.37508 11.4583C7.07389 11.4583 5.20841 9.59285 5.20841 7.29167C5.20841 4.99048 7.07389 3.125 9.37508 3.125C11.6763 3.125 13.5417 4.99048 13.5417 7.29167Z"
        stroke="#D4476B"
        strokeOpacity={0.8}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconArtigos() {
  return (
    <Svg width={28} height={28} viewBox="0 0 32 32" fill="none">
      <Path
        d="M26.6666 12L17.3333 2.66666H7.99992C7.29267 2.66666 6.6144 2.94761 6.1143 3.4477C5.6142 3.9478 5.33325 4.62608 5.33325 5.33332V26.6667C5.33325 27.3739 5.6142 28.0522 6.1143 28.5523C6.6144 29.0524 7.29267 29.3333 7.99992 29.3333H23.9999C24.7072 29.3333 25.3854 29.0524 25.8855 28.5523C26.3856 28.0522 26.6666 27.3739 26.6666 26.6667V12ZM17.3333 2.66666L17.3333 12H26.6666"
        stroke="#D4476B"
        strokeOpacity={0.8}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconQuestionario() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7H13C13.5304 7 14.0391 6.78929 14.4142 6.41421C14.7893 6.03914 15 5.53043 15 5M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5M9 12H15M9 16H12"
        stroke="#D4476B"
        strokeOpacity={0.8}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Gráfico de barras ────────────────────────────────────────────────────────
function Grafico({ dados }: { dados: CadastroSemana[] }) {
  const maxVal = Math.max(...dados.map((d) => d.total), 1);
  const ALTURA_MAX = 80;
  return (
    <View style={grafico.wrap}>
      {dados.map((item, i) => (
        <View key={i} style={grafico.coluna}>
          <Text style={grafico.valor}>{item.total}</Text>
          <View style={grafico.barraWrap}>
            <View style={[grafico.barra, { height: Math.max(8, (item.total / maxVal) * ALTURA_MAX) }]} />
          </View>
          <Text style={grafico.label}>{item.semana}</Text>
        </View>
      ))}
    </View>
  );
}

const grafico = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 12 },
  coluna: { flex: 1, alignItems: "center", gap: 4 },
  barraWrap: { height: 80, justifyContent: "flex-end" },
  barra: { width: 28, backgroundColor: ROSA, borderRadius: 6, opacity: 0.85 },
  valor: { fontSize: 11, color: ROSA, fontWeight: "700" },
  label: { fontSize: 10, color: SUAVE, marginTop: 2 },
});

// ─── Card de estatística ──────────────────────────────────────────────────────
function StatCard({
  icone, numero, label, detalhe1, detalhe2, rodape, onPress,
}: {
  icone: React.ReactElement; numero: number; label: string;
  detalhe1?: string; detalhe2?: string; rodape?: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={stat.card} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <View style={stat.topo}>
        <View style={stat.iconeWrap}>{icone}</View>
        <View>
          <Text style={stat.numero}>{numero}</Text>
          <Text style={stat.label}>{label}</Text>
        </View>
      </View>
      {(detalhe1 || detalhe2) && (
        <View style={stat.detalhes}>
          {detalhe1 ? <Text style={stat.detalheTexto}>{detalhe1}</Text> : null}
          {detalhe2 ? <Text style={stat.detalheTexto}>{detalhe2}</Text> : null}
        </View>
      )}
      {rodape ? (
        <TouchableOpacity onPress={onPress} style={stat.rodapeWrap}>
          <Text style={stat.rodapeTexto}>{rodape} →</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const stat = StyleSheet.create({
  card: { flex: 1, backgroundColor: ROSA_CARD, borderRadius: 18, padding: 14, gap: 8, shadowColor: ROSA, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  topo: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconeWrap: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  numero: { fontSize: 28, fontWeight: "700", color: ROSA, lineHeight: 32 },
  label: { fontSize: 12, color: SUAVE, fontWeight: "500" },
  detalhes: { gap: 2, paddingLeft: 2 },
  detalheTexto: { fontSize: 12, color: SUAVE },
  rodapeWrap: { marginTop: 2 },
  rodapeTexto: { fontSize: 12, color: ROSA, fontWeight: "600" },
});

// ─── Card de cadastro recente ─────────────────────────────────────────────────
function CadastroCard({ usuario }: { usuario: CadastroRecente }) {
  return (
    <View style={user.card}>
      {usuario.foto_url ? (
        <Image source={{ uri: usuario.foto_url }} style={user.avatar} />
      ) : (
        <View style={user.avatarPlaceholder}>
          <Text style={user.avatarLetra}>{usuario.name?.charAt(0)?.toUpperCase() ?? "?"}</Text>
        </View>
      )}
      <View style={user.info}>
        <Text style={user.nome}>{usuario.name}</Text>
        <Text style={user.email}>{usuario.email}</Text>
        <Text style={user.tempo}>{tempoRelativo(usuario.created_at)}</Text>
      </View>
    </View>
  );
}

const user = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", backgroundColor: ROSA_CARD, borderRadius: 14, padding: 12, marginBottom: 8, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarPlaceholder: { width: 46, height: 46, borderRadius: 23, backgroundColor: ROSA, alignItems: "center", justifyContent: "center" },
  avatarLetra: { color: "#fff", fontSize: 18, fontWeight: "700" },
  info: { flex: 1 },
  nome: { fontSize: 15, fontWeight: "700", color: ROSA },
  email: { fontSize: 12, color: SUAVE, marginTop: 1 },
  tempo: { fontSize: 11, color: SUAVE, marginTop: 2 },
});

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentes, setRecentes] = useState<CadastroRecente[]>([]);
  const [semanas, setSemanas] = useState<CadastroSemana[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => { carregarDados(); }, [])
  );

  async function carregarDados() {
    setCarregando(true);
    try {
      const [statsData, recentesData, semanasData] = await Promise.all([
        apiFetch("/api/admin/stats"),
        apiFetch("/api/admin/cadastros-recentes"),
        apiFetch("/api/admin/cadastros-semanas"),
      ]);
      setStats(statsData);
      setRecentes(Array.isArray(recentesData) ? recentesData : recentesData.data ?? []);
      setSemanas(Array.isArray(semanasData) ? semanasData : semanasData.data ?? []);
    } catch {
      setStats({
        total_usuarios: 0, novos_essa_semana: 0, sem_questionario: 0,
        total_questionarios: 0, questionarios_preenchidos: 0, questionarios_pendentes: 0,
        total_artigos: 0, artigos_recentes: 0, artigos_esse_mes: 0,
      });
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />
        <ActivityIndicator size="large" color={ROSA} />
      </View>
    );
  }

  const totalCadastros = semanas.reduce((acc, s) => acc + s.total, 0);

  return (
    <View style={styles.outer}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header: textos à esquerda, logo à direita ── */}
        <View style={styles.headerWrap}>
          <View style={styles.headerEsquerda}>
            <Text style={styles.headerSub}>Painel Admin</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <Image
            source={require("../../assets/images/demeter.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Linha divisória rosa */}
        <View style={styles.headerDivisor} />

        {/* ── Stats: Usuários + Questionários ── */}
        <View style={styles.row}>
          <StatCard
            icone={<IconUsuarios />}
            numero={stats?.total_usuarios ?? 0}
            label="Usuários"
            detalhe1={`Esta semana  +${stats?.novos_essa_semana ?? 0}`}
            detalhe2={`Sem quest.  ${stats?.sem_questionario ?? 0}`}
          />
          <StatCard
            icone={<IconQuestionario />}
            numero={stats?.total_questionarios ?? 0}
            label="Questionários"
            detalhe1={`Preenchidos  ${stats?.questionarios_preenchidos ?? 0}`}
            detalhe2={`Pendentes  ${stats?.questionarios_pendentes ?? 0}`}
            rodape="Ver respostas"
            onPress={() => router.push("/admin/usuarios" as any)}
          />
        </View>

        {/* ── Stats: Artigos ── */}
        <StatCard
          icone={<IconArtigos />}
          numero={stats?.total_artigos ?? 0}
          label="Artigos publicados"
          detalhe1={`Publicados recentemente  +${stats?.artigos_recentes ?? 0}`}
          detalhe2={`Publicados esse mês  ${stats?.artigos_esse_mes ?? 0}`}
        />

        {/* ── Gráfico ── */}
        {semanas.length > 0 && (
          <View style={styles.cardSecao}>
            <View style={styles.secaoHeader}>
              <Text style={styles.secaoTitulo}>
                Novos cadastros — {semanas.length} semanas
              </Text>
              <Text style={styles.secaoBadge}>{totalCadastros} Total</Text>
            </View>
            <Grafico dados={semanas} />
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.adminnavbarWrap}>
        <AdminNavbar current="dashboard" />
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: ROSA_CLARO },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: ROSA_CLARO },
  scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 },

  // ── Header ──
  headerWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerEsquerda: {
    flex: 1,
  },
  headerSub: { fontSize: 13, color: ROSA, fontWeight: "500" },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: ROSA,
    lineHeight: 38,
  },
  headerLogo: {
    width: 100,
    height: 100,
  },

  // Linha divisória
  headerDivisor: {
    height: 1.5,
    backgroundColor: ROSA_BORDA,
    borderRadius: 2,
    opacity: 0.7,
    marginBottom: 16,
  },

  row: { flexDirection: "row", gap: 12, marginBottom: 12 },

  cardSecao: { backgroundColor: ROSA_CARD, borderRadius: 18, padding: 16, marginTop: 12, shadowColor: ROSA, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  secaoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  secaoTitulo: { fontSize: 16, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", color: ROSA, flex: 1 },
  secaoBadge: { fontSize: 22, fontWeight: "700", color: ROSA, marginLeft: 8 },

  adminnavbarWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});