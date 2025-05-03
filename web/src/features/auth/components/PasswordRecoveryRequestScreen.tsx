import { Toaster } from "react-hot-toast";
import logo from "/scan-removebg-preview.png";
import PasswordRecoveryRequestForm from "./PasswordRecoveryRequestForm";

const PasswordRecoveryRequestScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <Toaster position="top-right" />
      <div className="flex w-full max-w-md flex-col items-center">
        <img src={logo} alt="Scan Logo" className="mb-5 h-24 w-24" />
        <h1 className="mb-2 text-3xl font-bold text-orange-400">Recuperação de Senha</h1>
        <p className="mb-8 text-center text-gray-500">
          Informe seu e-mail para receber instruções de recuperação
        </p>
        <PasswordRecoveryRequestForm />
      </div>
    </div>
  );
};

export default PasswordRecoveryRequestScreen; 