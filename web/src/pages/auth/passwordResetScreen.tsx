import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api"; 
import { Toaster, toast } from "react-hot-toast"; 

const PasswordResetScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'seu e-mail';
  const resetCode = location.state?.resetCode;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (!email || !resetCode) {
      toast.error("Dados de e-mail ou código não encontrados. Tente novamente.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/password-recovery/reset", {
        email: email as string,
        resetCode: resetCode as string,
        newPassword,
      });
      if (response.status === 200) {
        toast.success("Senha redefinida com sucesso! Redirecionando para login.");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao redefinir a senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <Toaster position="top-right" />
      <div className="flex w-full max-w-md flex-col items-center">
        <h1 className="mb-8 text-4xl font-bold text-orange-400">Redefinir Senha</h1>
        <p className="mb-4 text-center text-gray-700">
          Digite sua nova senha e confirme-a:
        </p>
        <input
          type="password"
          placeholder="Nova senha"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${loading ? "opacity-70" : "hover:opacity-90"}`}
        >
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
        <button
          onClick={() => navigate(-1)}
          disabled={loading}
          className="mt-4 w-full rounded-md bg-gray-300 py-3 text-lg font-bold text-gray-800 transition-opacity hover:opacity-90"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PasswordResetScreen;