import axios from "axios";

// 1. Descubra o IP da sua máquina (ex: 192.168.1.10)
// Não use "localhost", o celular não entende o que é localhost!
const meuIP = "192.168.0.106";

const api = axios.create({
  baseURL: `http://${meuIP}:8000/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Isso é importante caso você decida usar Cookies/Sessão no futuro,
  // embora em Mobile o padrão seja usar Tokens (Bearer Token)
  withCredentials: true,
});

export default api;
