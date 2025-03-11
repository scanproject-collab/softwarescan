import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  name: string;

}

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("userToken"));
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Token atualizado:", token);
    if (!token) {
      console.log("Nenhum token encontrado, redirecionando para /login...");
      setUser(null);
      navigate("/login");
    }

  }, [token, navigate]);

  const setAuthToken = (newToken: string | null, userData?: User) => {
    if (newToken) {
      localStorage.setItem("userToken", newToken);
      if (userData) {
        setUser(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      setUser(null);
    }
    setToken(newToken);
  };

  return { token, setAuthToken, user };
};