import TrashIcon from "../../components/TrashIcon";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Paleta ───────────────────────────────────────────────────────────────────
const ROSA        = "#D4476B";
const ROSAd       = "#e0849a";
const ROSA_CLARO  = "#fce8ed";
const ROSA_LIGHT  = "#fff0f3";
const TEXTO       = "#9a6070";
const BRANCO      = "#ffffff";
const VERMELHO    = "#c0394f";
const VERMELHO_BG = "#fdedef";

// ─── Tipagem ──────────────────────────────────────────────────────────────────
type Usuario = {
  id: number;
  nome: string;
  email: string;
  foto_url: string | null;
  created_at: string;
};

// ─── Helper: tempo desde cadastro ─────────────────────────────────────────────
const tempoDesde = (dateStr: string): string => {
  const agora = new Date();
  const criado = new Date(dateStr);
  const diffMs = agora.getTime() - criado.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return "há menos de 1 dia";
  if (diffDias === 1) return "há 1 dia";
  if (diffDias < 7)  return `há ${diffDias} dias`;

  const diffSemanas = Math.floor(diffDias / 7);
  if (diffSemanas === 1) return "há 1 semana";
  if (diffSemanas < 4)  return `há ${diffSemanas} semanas`;

  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses === 1) return "há 1 mês";
  if (diffMeses < 12) return `há ${diffMeses} meses`;

  const diffAnos = Math.floor(diffDias / 365);
  if (diffAnos === 1) return "há 1 ano";
  return `há ${diffAnos} anos`;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ uri, nome }: { uri: string | null; nome: string }) => {
  const inicial = nome?.charAt(0).toUpperCase() ?? "?";
  if (uri) return <Image source={{ uri }} style={styles.avatar} />;
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarInicial}>{inicial}</Text>
    </View>
  );
};

// ─── Modal de confirmação customizado ────────────────────────────────────────
const ConfirmModal = ({
  visible,
  nome,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  nome: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Modal
    transparent
    animationType="fade"
    visible={visible}
    onRequestClose={onCancel}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.alertIcon}>⚠</Text>
        <Text style={styles.modalTitulo}>Tem certeza que deseja{"\n"}excluir esse usuário?</Text>
        <Text style={styles.modalSubtitulo}>{nome}</Text>

        <TouchableOpacity style={styles.modalBtnExcluir} onPress={onConfirm} activeOpacity={0.85}>
          <Text style={styles.modalBtnExcluirText}>Excluir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalBtnCancelar} onPress={onCancel} activeOpacity={0.85}>
          <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── Card de usuário ──────────────────────────────────────────────────────────
const UsuarioCard = ({
  item,
  onDelete,
}: {
  item: Usuario;
  onDelete: () => void;
}) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <Avatar uri={item.foto_url} nome={item.nome} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.cardEmail} numberOfLines={1}>{item.email}</Text>
        <Text style={styles.cardTempo}>{tempoDesde(item.created_at)}</Text>
      </View>
    </View>

<TouchableOpacity
  style={styles.btnDeletar}
  onPress={onDelete}
  activeOpacity={0.8}
>
  <View style={styles.btnDeletarIconContainer}>
    <TrashIcon />
  </View>

  <Text style={styles.btnDeletarText}>
    Deletar usuário
  </Text>
</TouchableOpacity>
  </View>
);

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function AdminUsuariosScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<{ id: number; nome: string } | null>(null);

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/admin/usuarios`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setUsuarios(json.data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (id: number, nome: string) => {
    setUsuarioSelecionado({ id, nome });
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setUsuarioSelecionado(null);
  };

  const confirmarDelete = async () => {
    if (!usuarioSelecionado) return;
    const { id } = usuarioSelecionado;
    fecharModal();
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch {
      Alert.alert("Erro", "Não foi possível deletar o usuário.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ROSA} />
        <Text style={styles.loadingText}>Carregando usuários…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ROSA_CLARO} />

      {/* Modal de confirmação */}
      <ConfirmModal
        visible={modalVisible}
        nome={usuarioSelecionado?.nome ?? ""}
        onConfirm={confirmarDelete}
        onCancel={fecharModal}
      />

      <FlatList
        data={usuarios}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}

        ListHeaderComponent={
          <View style={styles.header}>
            {/* Título + logo subidos */}
            <View style={styles.headerTop}>
              <Text style={styles.title}>Usuários{"\n"}cadastrados</Text>
              <Image
                source={require("../../assets/images/demeter.png")}
                style={{ width: 120, height: 120, opacity: 0.9 }}
                resizeMode="contain"
              />
            </View>

            {/* Contador */}
            <View style={styles.contadorBadge}>
              <Text style={styles.contadorText}>
                {usuarios.length} {usuarios.length === 1 ? "usuária cadastrada" : "usuárias cadastradas"}
              </Text>
            </View>
          </View>
        }

        // ── Container externo que agrupa todos os cards ──
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyTitle}>Nenhum usuário ainda</Text>
            <Text style={styles.emptySubtitle}>Os usuários cadastrados aparecerão aqui.</Text>
          </View>
        }

        // ── Wrapper externo dos cards ──
        renderItem={({ item, index }) => (
          <View style={[
            styles.cardWrapper,
            index === 0 && styles.cardWrapperFirst,
            index === usuarios.length - 1 && styles.cardWrapperLast,
          ]}>
            <UsuarioCard
              item={item}
              onDelete={() => abrirModal(item.id, item.nome)}
            />
          </View>
        )}

        // Container externo ao redor de todos os cards
        ListFooterComponent={<View style={{ height: 8 }} />}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const AVATAR_SIZE = 62;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROSA_CLARO,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ROSA_CLARO,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: TEXTO,
    fontWeight: "500",
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // ── Cabeçalho ───────────────────────────────────────────────────────────────
  header: {
    paddingTop: 50,   // subido
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 38,       // maior
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    lineHeight: 46,
    flex: 1,
  },

  contadorBadge: {
    backgroundColor: BRANCO,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 8,
  },
  contadorText: {
    fontSize: 18,
    color: ROSA,
    fontWeight: "600",
  },

  // ── Container externo (div maior) ────────────────────────────────────────────
  cardWrapper: {
    backgroundColor: BRANCO,
    marginHorizontal: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    // Sombra no container externo
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 5,
    borderRadius: 0,
  },
  cardWrapperFirst: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  cardWrapperLast: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 12,
    marginBottom: 0,
  },

  // ── Card individual (div menor) ───────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFAFA",
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  // Avatar
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: ROSAd,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: BRANCO,
    borderWidth: 2,
    borderColor: ROSAd,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInicial: {
    fontSize: 24,
    fontWeight: "700",
    color: ROSA,
    fontFamily: "serif",
  },

  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardNome: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    marginBottom: 2,
  },
  cardEmail: {
    fontSize: 16,
    color: TEXTO,
    marginBottom: 4,
  },
  cardTempo: {
    fontSize: 15,
    color: ROSAd,
    fontWeight: "500",
  },

btnDeletar: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
  paddingVertical: 14,
  paddingHorizontal: 12,
},

alertIcon: {
    color: "#ff6666",
    fontSize: 48,
    marginRight: 8,
  },
btnDeletarIconContainer: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#FF1A1A",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 16,
},

btnDeletarText: {
  color: "#FF1A1A",
  fontSize: 15,
  fontWeight: "700",
  fontFamily: "serif",
},

  // ── Estado vazio ─────────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXTO,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: BRANCO,
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 14,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "serif",
    color: ROSA,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 6,
  },
  modalSubtitulo: {
    fontSize: 13,
    color: TEXTO,
    textAlign: "center",
    marginBottom: 24,
  },
  modalBtnExcluir: {
    backgroundColor: ROSAd,
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: ROSA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBtnExcluirText: {
    color: BRANCO,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "serif",
  },
  modalBtnCancelar: {
    backgroundColor: "#ececec",
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  modalBtnCancelarText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
});