import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("userToken"));
  const navigate = useNavigate();


  useEffect(() => {
    console.log("Token atualizado:", token);
    if (!token) {
      console.log("Nenhum token encontrado, redirecionando para /login...");
      navigate("/login");
    }
  }, [token, navigate]);

  const setAuthToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("userToken", newToken);
    } else {
      localStorage.removeItem("userToken");
    }
    setToken(newToken);
  };

  return { token, setAuthToken, user: null };
};