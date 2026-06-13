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

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Cores ────────────────────────────────────────────────────────────────────
const ROSA       = "#b5405a";
const ROSA_CLARO = "#fce8ed";
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
  icone: string; numero: number; label: string;
  detalhe1?: string; detalhe2?: string; rodape?: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={stat.card} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <View style={stat.topo}>
        <Text style={stat.icone}>{icone}</Text>
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
  icone: { fontSize: 22 },
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

  async function handleLogout() {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user_role");
    router.replace("/login" as any);
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

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Painel Admin</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <Image
            source={require("../../assets/images/demeter.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.bemVinda}>"Seja bem vinda(o)!"</Text>

        {/* ── Ações rápidas ── */}
        <View style={styles.grupo}>
          <TouchableOpacity style={styles.btnPrimario} onPress={() => router.push("/admin/create_receita" as any)}>
            <Text style={styles.btnPrimarioText}>+ Nova Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimario} onPress={() => router.push("/admin/create_artigo" as any)}>
            <Text style={styles.btnPrimarioText}>+ Novo Artigo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimario} onPress={() => router.push("/admin/usuarios" as any)}>
            <Text style={styles.btnPrimarioText}>Usuários</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grupo}>
          <TouchableOpacity style={styles.btnSecundario} onPress={() => router.push("/admin/receitas" as any)}>
            <Text style={styles.btnSecundarioText}>Gerenciar Receitas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecundario} onPress={() => router.push("/admin/artigos" as any)}>
            <Text style={styles.btnSecundarioText}>Gerenciar Artigos</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats: Usuários + Questionários ── */}
        <View style={styles.row}>
          <StatCard
            icone="👤"
            numero={stats?.total_usuarios ?? 0}
            label="Usuários"
            detalhe1={`Esta semana  +${stats?.novos_essa_semana ?? 0}`}
            detalhe2={`Sem quest.  ${stats?.sem_questionario ?? 0}`}
          />
          <StatCard
            icone="📋"
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
          icone="📄"
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

        {/* ── Cadastros recentes ── */}
        {recentes.length > 0 && (
          <View style={styles.cardSecao}>
            <Text style={styles.secaoTitulo}>Cadastros recentes</Text>
            <View style={{ marginTop: 12 }}>
              {recentes.map((u) => (
                <CadastroCard key={u.id} usuario={u} />
              ))}
            </View>
          </View>
        )}

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  headerSub: { fontSize: 13, color: ROSA, fontWeight: "500" },
  headerTitle: { fontSize: 32, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", color: ROSA, lineHeight: 38 },
  headerLogo: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#f8d7da" },

  bemVinda: { fontSize: 16, color: ROSA, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", textAlign: "center", marginVertical: 20 },

  grupo: { flexDirection: "row", gap: 10, marginBottom: 10 },
  btnPrimario: { flex: 1, backgroundColor: ROSA, borderRadius: 14, paddingVertical: 14, alignItems: "center", shadowColor: ROSA, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 2 },
  btnPrimarioText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  btnSecundario: { flex: 1, backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1.5, borderColor: ROSA_BORDA },
  btnSecundarioText: { color: ROSA, fontSize: 13, fontWeight: "600" },

  row: { flexDirection: "row", gap: 12, marginBottom: 12, marginTop: 8 },

  cardSecao: { backgroundColor: ROSA_CARD, borderRadius: 18, padding: 16, marginTop: 12, shadowColor: ROSA, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  secaoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  secaoTitulo: { fontSize: 16, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", color: ROSA, flex: 1 },
  secaoBadge: { fontSize: 22, fontWeight: "700", color: ROSA, marginLeft: 8 },

  btnLogout: { marginTop: 20, backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1.5, borderColor: ROSA_BORDA },
  btnLogoutText: { color: ROSA, fontSize: 14, fontWeight: "600" },

  adminnavbarWrap: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0 
  },
});