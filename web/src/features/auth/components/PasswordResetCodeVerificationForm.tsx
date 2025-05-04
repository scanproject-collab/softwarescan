import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../shared/services/api";
import toast from "react-hot-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../../components/ui/input-otp";

const PasswordResetCodeVerificationForm = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Por favor, informe o código de verificação completo.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/verify-reset-code", { code: verificationCode });
      navigate(`/reset-password/${verificationCode}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Código inválido. Por favor, verifique e tente novamente.";
      toast.error(errorMessage);
      console.error("Erro na verificação:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <div className="mb-6 w-full">
        <InputOTP
          value={verificationCode}
          onChange={setVerificationCode}
          maxLength={6}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} index={index} {...slot} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || verificationCode.length !== 6}
        className={`mb-4 w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${isLoading || verificationCode.length !== 6 ? "opacity-70" : "hover:opacity-90"
          }`}
      >
        {isLoading ? "Verificando..." : "Verificar"}
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

export default PasswordResetCodeVerificationForm; 