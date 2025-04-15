import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { RotatingLines } from "react-loader-spinner";
import Navbar from "../../components/Navbar";

interface Institution {
  id: string;
  title: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  institution: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
}

const ManagerManagement = () => {
  const {} = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // New manager form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Fetch existing institutions and managers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch institutions
        const institutionsResponse = await api.get("/institutions");
        setInstitutions(institutionsResponse.data.institutions);
        
        // Fetch managers
        const managersResponse = await api.get("/admin/managers");
        setManagers(managersResponse.data.managers);
        
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Erro ao carregar dados";
        toast.error(errorMessage);
        console.error("Erro:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Create a new manager
  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Generate verification code for the user
      const verificationCodeResponse = await api.post("/auth/generate-verification-code", {
        email
      });
      
      if (verificationCodeResponse.data.verificationCode) {
        // Create manager with the verification code
        const createResponse = await api.post("/admin/managers", {
          name,
          email,
          password,
          institutionId: selectedInstitution || null,
          verificationCode: verificationCodeResponse.data.verificationCode,
          role: "MANAGER"
        });
        
        // Add the new manager to the list
        setManagers((prevManagers) => [
          ...prevManagers,
          createResponse.data.manager
        ]);
        
        // Reset form
        setName("");
        
        setEmail("");
        setPassword("");
        setSelectedInstitution("");
        setShowCreateForm(false);
        
        toast.success("Gerente criado com sucesso!");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao criar gerente";
      toast.error(errorMessage);
      console.error("Erro:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Update manager's institution
  const handleUpdateInstitution = async (managerId: string, institutionId: string) => {
    try {
      await api.put(`/admin/managers/${managerId}/institution`, {
        institutionId: institutionId || null
      });
      
      // Update the managers list with the updated manager
      setManagers(prevManagers => 
        prevManagers.map(manager => 
          manager.id === managerId 
            ? {
                ...manager, 
                institution: institutions.find(inst => inst.id === institutionId) 
                  ? { 
                      id: institutionId, 
                      title: institutions.find(inst => inst.id === institutionId)!.title 
                    } 
                  : null
              } 
            : manager
        )
      );
      
      toast.success("Instituição do gerente atualizada com sucesso!");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao atualizar instituição do gerente";
      toast.error(errorMessage);
      console.error("Erro:", error);
    }
  };
  
  // Delete a manager
  const handleDeleteManager = async (managerId: string) => {
    if (!confirm("Tem certeza que deseja excluir este gerente? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      await api.delete(`/admin/managers/${managerId}`);
      
      // Remove the deleted manager from the list
      setManagers(prevManagers => 
        prevManagers.filter(manager => manager.id !== managerId)
      );
      
      toast.success("Gerente excluído com sucesso!");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao excluir gerente";
      toast.error(errorMessage);
      console.error("Erro:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <RotatingLines
          strokeColor="rgb(251 146 60)"
          strokeWidth="5"
          animationDuration="0.75"
          width="50"
          visible={true}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <Navbar />
      <Toaster position="top-right" />
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Gerentes</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-md bg-orange-400 px-4 py-2 font-bold text-white hover:bg-orange-500"
        >
          {showCreateForm ? "Cancelar" : "Adicionar Gerente"}
        </button>
      </div>
      
      {/* Create Manager Form */}
      {showCreateForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Criar Novo Gerente</h2>
          <form onSubmit={handleCreateManager}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
                placeholder="Nome do Gerente"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
                placeholder="Senha"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Instituição
              </label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
              >
                <option value="">Selecione uma instituição</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.title}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={isCreating}
              className={`w-full rounded-md bg-orange-400 py-2 font-bold text-white hover:bg-orange-500 ${
                isCreating ? "opacity-70" : ""
              }`}
            >
              {isCreating ? "Criando..." : "Criar Gerente"}
            </button>
          </form>
        </div>
      )}
      
      {/* Managers List */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Gerentes Cadastrados</h2>
        
        {managers.length === 0 ? (
          <p className="text-gray-500">Nenhum gerente cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Instituição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {managers.map((manager) => (
                  <tr key={manager.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {manager.name || "Sem nome"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {manager.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <select
                        value={manager.institution?.id || ""}
                        onChange={(e) => handleUpdateInstitution(manager.id, e.target.value)}
                        className="rounded-md border border-gray-300 p-1 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
                      >
                        <option value="">Sem instituição</option>
                        {institutions.map((institution) => (
                          <option key={institution.id} value={institution.id}>
                            {institution.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(manager.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => handleDeleteManager(manager.id)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerManagement;
