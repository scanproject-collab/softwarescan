import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import logo from "/scan-removebg-preview.png";

const PasswordRecoveryRequestScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.includes("@")) {
      toast.error("Digite um e-mail válido");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/password-recovery/request", { email });
      if (response.status === 200) {
        toast.success(`Um e-mail de recuperação foi enviado para ${email}`);
        navigate("/recovery/success", { state: { email } });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao enviar o e-mail de recuperação";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <Toaster position="top-right" />
      <div className="flex w-full max-w-md flex-col items-center">
        <img src={logo} alt="Scan Logo" className="mb-5 h-24 w-24" />
        <h1 className="mb-8 text-4xl font-bold text-orange-400">Scan</h1>
        <p className="mb-4 text-center text-gray-700">
          Para recuperar sua senha, digite abaixo seu email:
        </p>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${
            loading ? "opacity-70" : "hover:opacity-90"
          }`}
        >
          {loading ? "Enviando..." : "Enviar email de recuperação"}
        </button>
        <button
        onClick={() => navigate(-1)}
        disabled={loading}
        className="mt-4 text-orange-400 hover:underline float-left"
        >
        Voltar
        </button>
      </div>
    </div>
  );
};

export default PasswordRecoveryRequestScreen;