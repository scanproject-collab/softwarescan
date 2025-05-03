import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../shared/services/api";
import toast from "react-hot-toast";
import { PasswordResetData } from "../types/auth.types";

const PasswordResetForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      if (!code) {
        toast.error("Código de verificação inválido.");
        return;
      }

      const resetData: PasswordResetData = {
        code,
        password
      };

      await api.post("/auth/reset-password", resetData);
      toast.success("Senha redefinida com sucesso!");
      navigate("/login");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao redefinir a senha. Por favor, tente novamente.";
      toast.error(errorMessage);
      console.error("Erro ao redefinir senha:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <input
        type="password"
        placeholder="Confirme a nova senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`mb-4 w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${isLoading ? "opacity-70" : "hover:opacity-90"
          }`}
      >
        {isLoading ? "Processando..." : "Redefinir Senha"}
      </button>

      <button
        onClick={() => navigate("/login")}
        className="text-orange-400 hover:underline"
      >
        Voltar para o Login
      </button>
    </div>
  );
};

export default PasswordResetForm; 