import { useNavigate } from "react-router-dom";
import logo from "/scan-removebg-preview.png";
import { Toaster } from "react-hot-toast";

const PasswordRecoverySuccessScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <Toaster position="top-right" />
      <div className="flex w-full max-w-md flex-col items-center">
        <img src={logo} alt="Scan Logo" className="mb-5 h-24 w-24" />
        <h1 className="mb-2 text-3xl font-bold text-orange-400">E-mail Enviado</h1>
        <p className="mb-6 text-center text-gray-600">
          Um e-mail com instruções para recuperação de senha foi enviado para o endereço informado.
        </p>
        <p className="mb-6 text-center text-gray-500">
          Por favor, verifique sua caixa de entrada e também a pasta de spam.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="rounded-md bg-orange-400 px-6 py-3 text-lg font-bold text-white transition-opacity hover:opacity-90"
        >
          Voltar para o Login
        </button>
      </div>
    </div>
  );
};

export default PasswordRecoverySuccessScreen; 