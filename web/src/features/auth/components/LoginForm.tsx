import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../shared/services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { LoginCredentials } from "../types/auth.types";
import { showSuccess, showError } from "../../../shared/utils/errorHandler";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      showError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      const credentials: LoginCredentials = {
        email,
        password
      };

      const response = await api.post("/auth/login", credentials);

      const { token, user } = response.data;
      const role = user.role;

      if (role !== "ADMIN" && role !== "MANAGER") {
        showError(
          `Acesso negado! Apenas usuários ADMIN ou MANAGER podem fazer login nesta plataforma. Seu role: ${role}.`
        );
        setIsLoading(false);
        return;
      }

      const success = await setAuthToken(token, user);
      if (success) {
        // Use userName if available, otherwise fallback to "de volta"
        const userName = user?.name ? `, ${user.name}` : " de volta";
        showSuccess(`Bem-vindo${userName}!`);
        navigate("/");
      } else {
        showError("Falha ao verificar o token. Tente novamente.");
        navigate("/login");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao fazer login, verifique suas credenciais.";
      showError(errorMessage);
      console.error("Erro no login:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleLogin();
          }
        }}
      />

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${isLoading ? "opacity-70" : "hover:opacity-90"
          }`}
      >
        {isLoading ? "Carregando..." : "Login"}
      </button>

      <div className="mt-5 flex w-full justify-between">
        <button
          onClick={() => navigate("/recovery")}
          className="text-orange-400 hover:underline"
        >
          Esqueceu a Senha?
        </button>
      </div>
    </div>
  );
};

export default LoginForm; 