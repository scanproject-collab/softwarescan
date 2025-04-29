// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface User {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  institutionId?: string;
  institution?: { title: string };
  createdAt?: string;
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
      await api.get("/auth/verify-token", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      return true;
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      navigate("/login");
    }
  }, [token, navigate]);

  const setAuthToken = async (newToken: string | null, userData?: User) => {
    if (newToken) {
      localStorage.setItem("userToken", newToken);
      if (userData) {
        setUser(userData); // Define o user com os dados completos do login
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      setToken(newToken);

      const isValid = await verifyToken(newToken);
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

  // Adiciona função para atualizar os dados do usuário
  const updateUserData = (userData: User) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  return { token, setAuthToken, user, verifyToken, updateUserData };
};