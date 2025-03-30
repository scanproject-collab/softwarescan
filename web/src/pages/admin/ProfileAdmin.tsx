import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";

const ProfileScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Usuário não autenticado. Redirecionando para login...");
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }
  
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Navbar />
      <Toaster position="top-right" />
      <div className="flex flex-col items-center p-8">
        <div className="w-24 h-24 bg-blue-500 text-white flex items-center justify-center text-4xl font-bold rounded-full">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-4 text-2xl font-semibold">{user.name}</h1>

        <div className="mt-6 w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-700"><strong>Email:</strong> {user.email || "Não informado"}</p>
          <p className="text-gray-700 mt-2"><strong>Instituição:</strong> {user.institution?.title || "Instituição Não Informada"}</p>
          <p className="text-gray-700 mt-2"><strong>Data de Criação:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "Não disponível"}</p>
        </div>

        <button
          onClick={() => navigate(`/admin/update`)}
          className="mt-6 px-6 py-2 bg-blue-900 text-white rounded-md text-lg font-semibold transition-colors duration-200 hover:bg-blue-600"
        >
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
