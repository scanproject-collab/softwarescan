// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface User {
  name: string;
  role?: string;
}

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("userToken"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("userData");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  const verifyToken = async (currentToken: string): Promise<boolean> => {
    try {
      console.log("Verificando token:", currentToken);
      const response = await api.get("/auth/verify-token", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      console.log("Resposta do verifyToken:", response.data);
      setUser(response.data.user);
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      return true;
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return false;
    }
  };

  useEffect(() => {
    console.log("Token atualizado:", token);
    if (!token) {
      console.log("Nenhum token encontrado, redirecionando para /login...");
      setUser(null);
      navigate("/login");
    }
  }, [token, navigate]);

  const setAuthToken = async (newToken: string | null, userData?: User) => {
    console.log("setAuthToken chamado com:", { newToken, userData });
    if (newToken) {
      localStorage.setItem("userToken", newToken);
      if (userData) {
        setUser(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      setToken(newToken);
      const isValid = await verifyToken(newToken);
      console.log("Token verificado com sucesso?", isValid);
      if (!isValid) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        setToken(null);
        setUser(null);
      }
      return isValid;
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      setUser(null);
      setToken(null);
      return false;
    }
  };

  return { token, setAuthToken, user, verifyToken };
};