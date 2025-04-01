import axios, { InternalAxiosRequestConfig } from "axios";

// Função para obter o token do localStorage
const token = (): string => {
  const result = localStorage.getItem("access_token");
  if (result) {
    try {
      const parsedResult = JSON.parse(result) as { token: string };
      return parsedResult.token;
    } catch {
      return "";
    }
  }
  return "";
};

// Criação da instância do Axios
const api = axios.create({});

// Interceptor para adicionar headers e configurar a baseURL
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const url = import.meta.env.REACT_APP_API_URL; // URL da API vinda do ambiente

  if (token()) {
    try {
      const accessToken = token();
      config.baseURL = url;

      // Adiciona os cabeçalhos usando o método `set` do AxiosHeaders
      if (config.headers) {
        config.headers.set("Authorization", accessToken ? `Bearer ${accessToken}` : "");
      }

      return config;
    } catch (error) {
      console.error(error);
    }
  } else {
    localStorage.clear();
    window.location.replace("/login");
  }

  return config; // Retorna o config mesmo em caso de erro para evitar problemas
});

export default api;