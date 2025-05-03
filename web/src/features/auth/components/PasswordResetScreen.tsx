import { Toaster } from "react-hot-toast";
import logo from "/scan-removebg-preview.png";
import PasswordResetForm from "./PasswordResetForm";

const PasswordResetScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <Toaster position="top-right" />
      <div className="flex w-full max-w-md flex-col items-center">
        <img src={logo} alt="Scan Logo" className="mb-5 h-24 w-24" />
        <h1 className="mb-2 text-3xl font-bold text-orange-400">Nova Senha</h1>
        <p className="mb-8 text-center text-gray-500">
          Defina uma nova senha para sua conta
        </p>
        <PasswordResetForm />
      </div>
    </div>
  );
};

export default PasswordResetScreen; 