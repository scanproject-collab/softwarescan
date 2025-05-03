import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../shared/services/api";
import toast from "react-hot-toast";
import { PasswordRecoveryData } from "../types/auth.types";

const PasswordRecoveryRequestForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Por favor, informe o seu e-mail.");
      return;
    }

    setIsLoading(true);
    try {
      const data: PasswordRecoveryData = { email };
      await api.post("/auth/request-password-reset", data);
      navigate("/recovery/success");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao solicitar recuperação de senha.";
      toast.error(errorMessage);
      console.error("Erro na recuperação de senha:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <input
        type="email"
        placeholder="Informe seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`mb-4 w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${isLoading ? "opacity-70" : "hover:opacity-90"
          }`}
      >
        {isLoading ? "Enviando..." : "Recuperar Senha"}
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

export default PasswordRecoveryRequestForm; 