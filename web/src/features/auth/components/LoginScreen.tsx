import { Toaster } from "react-hot-toast";
import logo from "/scan-removebg-preview.png";
import LoginForm from "./LoginForm";

const LoginScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <Toaster position="top-right" />
      <div className="flex w-full max-w-md flex-col items-center">
        <img src={logo} alt="Scan Logo" className="mb-5 h-24 w-24" />
        <h1 className="mb-8 text-4xl font-bold text-orange-400">Scan</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginScreen; 