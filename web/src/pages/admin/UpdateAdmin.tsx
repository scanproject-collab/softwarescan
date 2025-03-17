import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/Navbar";

const UpdateAdminScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get(`/admins/${id}`);
        setName(data.name);
        setEmail(data.email);
      } catch (error: any) {
        console.error("Erro ao buscar dados do administrador:", error.message);
        toast.error("Erro ao carregar dados do administrador.");
      }
    };
    fetchAdmin();
  }, [id]);

  const handleUpdate = async () => {
    if (!name || !email || (password && password !== confirmPassword)) {
      toast.error("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/admins/${id}`, { name, email, password });
      toast.success("Dados atualizados com sucesso!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Erro ao atualizar administrador:", error.message);
      toast.error("Erro ao atualizar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="flex flex-col bg-white">
      <Navbar />
      <div className="flex items-center justify-center bg-white px-8 py-21"> 
        <Toaster position="top-right" />
        <div className="flex w-full max-w-md flex-col items-center">
          <h1 className="mb-8 text-4xl font-bold text-orange-400">Editar Perfil Admin</h1>


          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`w-full rounded-md bg-orange-400 py-3 text-lg font-bold text-white transition-opacity ${
              loading ? "opacity-70" : "hover:opacity-90"
            }`}
          >
            {loading ? "Atualizando..." : "Atualizar"}
          </button>

          <div className="mt-5 flex w-full justify-between">

          <button
            onClick={() => navigate("/")}
            className="text-orange-400 hover:underline"
            >
              Ir para Home</button>

            <button
              onClick={() => navigate("/admin/Profile")}
              className="text-orange-400 hover:underline"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAdminScreen;
