import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast, Toaster } from "react-hot-toast";


const PasswordResetCodeVerificationScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'seu e-mail';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (code.length !== 6 || !/^[0-9a-fA-F]+$/.test(code)) {
      toast.error("Digite um código de 6 dígitos válido");
      return;
    }

    if (!email) {
      toast.error("E-mail não fornecido. Tente novamente.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/password-recovery/verify-code", {
        email: email as string,
        resetCode: code,
      });
      if (response.status === 200) {
        toast.success("Código verificado! Redirecionando para redefinir a senha.");
        navigate("/recovery/reset", { state: { email: email as string, resetCode: code } });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Código inválido ou expirado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <Toaster position="top-right" />
      <div className="flex w-full max-w-md flex-col items-center">
        <h1 className="mb-8 text-4xl font-bold text-orange-400">Verificação de Código</h1>
        <p className="mb-4 text-center text-gray-700">
          Digite o código de 6 dígitos enviado para {'\n'}
          <span className="text-green-600 font-bold">{email}</span>.
        </p>
        <input
          type="text"
          placeholder="Código de 6 dígitos"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          maxLength={6}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${loading ? "opacity-70" : "hover:opacity-90"}`}
        >
          {loading ? "Verificando..." : "Verificar Código"}
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

export default PasswordResetCodeVerificationScreen;