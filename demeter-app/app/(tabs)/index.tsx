import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
// Importando a sua conexão com o backend

export default function App() {
  // Aqui dentro você vai fazer as chamadas para o Demeter-API
  return (
    <View style={styles.container}>
      <Text>Bem-vindo ao App Demeter!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
