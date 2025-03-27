import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import api from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../components/Navbar";

const UpdateAdminScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (password && password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const updatedData: any = {};

      if (name) updatedData.name = name;
      if (email) updatedData.email = email;
      if (password) updatedData.password = password;

      console.log("Enviando dados para atualização:", updatedData);

      const response = await api.put(`/admin/update`, updatedData);

      console.log("Resposta da atualização:", response.data);

      toast.success("Dados atualizados com sucesso!");
      navigate("/admin/profile");
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
      <div className="flex items-center justify-center bg-white px-8 py-12">
        <Toaster position="top-right" />
        <div className="flex w-full max-w-md flex-col items-center">
          <h1 className="mb-8 text-4xl font-bold text-blue-500">Editar Perfil Admin</h1>

          <div className="relative w-full">
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 pr-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <Pencil className="absolute right-3 top-4 text-gray-400" size={20} />
          </div>

          <div className="relative w-full">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 pr-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <Pencil className="absolute right-3 top-4 text-gray-400" size={20} />
          </div>

          <div className="relative w-full">
            <input
              type="password"
              placeholder="Nova senha (opcional)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setShowConfirmPassword(!!e.target.value);
              }}
              className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 pr-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <Pencil className="absolute right-3 top-4 text-gray-400" size={20} />
          </div>

          {showConfirmPassword && (
            <div className="relative w-full">
              <input
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 pr-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <Pencil className="absolute right-3 top-4 text-gray-400" size={20} />
            </div>
          )}

          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`w-full rounded-md bg-blue-500 py-3 text-lg font-bold text-white transition-opacity ${
              loading ? "opacity-70" : "hover:opacity-90"
            }`}
          >
            {loading ? "Atualizando..." : "Atualizar"}
          </button>

          <div className="mt-5 flex w-full justify-between">
            <button onClick={() => navigate("/")} className="text-blue-400 hover:underline">
              Ir para Home
            </button>
            <button onClick={() => navigate("/admin/profile")} className="text-blue-400 hover:underline">
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAdminScreen;
