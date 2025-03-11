import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import logo from "/scan-removebg-preview.png";
import { useAuth } from "../../hooks/useAuth.ts";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;
      const role = user.role;
      console.log("Token:", token);
      console.log("User:", user);

      if (role !== "ADMIN") {
        toast.error(
            `Acesso negado! Apenas usuários ADMIN podem fazer login nesta plataforma. Seu role: ${role}.`,
            {
              duration: 5000,
              style: {
                background: "#f8d7da",
                color: "#721c24",
                border: "1px solid #f5c6cb",
              },
            }
        );
        return;
      }

      setAuthToken(token, user);
      toast.success("Bem-vindo de volta!");
      navigate("/");
    } catch (error: any) {
      const errorMessage =
          error?.response?.data?.message ||
          "Erro ao fazer login, verifique suas credenciais.";
      toast.error(errorMessage);
      console.error("Erro no login:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex min-h-screen items-center justify-center bg-white px-8">
        <Toaster position="top-right" />
        <div className="flex w-full max-w-md flex-col items-center">
          <img src={logo} alt="Scan Logo" className="mb-5 h-24 w-24" />
          <h1 className="mb-8 text-4xl font-bold text-orange-400">Scan</h1>

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
          />

          <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${
                  isLoading ? "opacity-70" : "hover:opacity-90"
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
      </div>
  );
};

export default Login;