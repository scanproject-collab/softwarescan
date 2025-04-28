import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import logo from "/scan-removebg-preview.png";

const PasswordRecoverySuccessScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'seu e-mail';

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <Toaster position="top-right" />
      <div className="flex w-full max-w-md flex-col items-center">
        <img src={logo} alt="Scan Logo" className="mb-5 h-24 w-24" />
        <h1 className="mb-8 text-4xl font-bold text-orange-400">Scan</h1>
        <p className="mb-4 text-center text-gray-700">
          Um email foi enviado para {'\n'}
          <span className="text-green-600 font-bold">{email}</span> {'\n'}
          com as instruções para redefinir sua senha.
        </p>
        <button
          onClick={() => navigate("/recovery/verify-code", { state: { email } })}
          className="w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity hover:opacity-90"
        >
          Prosseguir
        </button>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 w-full rounded-md bg-gray-300 py-3 text-lg font-bold text-gray-800 transition-opacity hover:opacity-90"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PasswordRecoverySuccessScreen;