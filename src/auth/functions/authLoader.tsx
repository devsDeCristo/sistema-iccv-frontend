// src/routes/authLoader.ts
import { redirect } from "react-router-dom";
import { apiClient } from "../../config/lib/axios/api-client";


export async function authLoader() {
  try {
    // tenta validar o token antes de montar a rota
    await apiClient.get("/auth/validate");
    return null;
  } catch {
  
    localStorage.removeItem("access_token");
    // interrompe o carregamento e leva ao login
    return redirect("/login");
  }
}
