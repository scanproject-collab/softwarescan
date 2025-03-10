import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("userToken"));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("userToken");
      setToken(newToken);

      console.log("Token mudou:", newToken);
      console.log("Token atual:", token);
      if (!newToken) {
        navigate("/login");
      }
    };


    if (!token) {
      navigate("/login");
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate, token]);

  const setAuthToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("userToken", newToken);
    } else {
      localStorage.removeItem("userToken");
    }
    setToken(newToken);
  };

  return { token, setAuthToken };
};