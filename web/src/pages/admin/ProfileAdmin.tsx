import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/Navbar";

const ProfileScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: "", email: "", institution: "", createdAt: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setUser({
          name: data.name,
          email: data.email,
          institution: data.institution || "Instituição Não Informada",
          createdAt: new Date(data.createdAt).toLocaleDateString("pt-BR"),
        });
      } catch (error: any) {
        console.error("Erro ao buscar dados do usuário:", error.message);
        toast.error("Erro ao carregar perfil.");
      }
    };
    fetchUser();
  }, [id]);

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
          <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-700 mt-2"><strong>Instituição:</strong> {user.institution}</p>
          <p className="text-gray-700 mt-2"><strong>Data de Criação:</strong> {user.createdAt}</p>
        </div>

        <button
          onClick={() => navigate(`/admin/update`)}
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md text-lg font-semibold hover:bg-blue-600"
        >
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
