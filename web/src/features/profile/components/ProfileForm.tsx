import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileData, ProfileUpdateData } from "../types/profile.types";
import { useProfile } from "../hooks/useProfile";

interface ProfileFormProps {
  initialData: ProfileData;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const { updateProfile, loading } = useProfile();

  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: initialData.name || "",
    email: initialData.email || "",
    password: "",
    currentPassword: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    currentPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
      valid = false;
    }

    // Se uma senha foi fornecida, verifique se a senha atual também foi
    if (formData.password && !formData.currentPassword) {
      newErrors.currentPassword = "Senha atual é obrigatória para alterar a senha";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Se nenhuma senha nova foi fornecida, remova os campos relacionados a senha
    const dataToSubmit: ProfileUpdateData = { ...formData };
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
      delete dataToSubmit.currentPassword;
    }

    const success = await updateProfile(dataToSubmit);
    if (success) {
      // Redirecionar de volta ao perfil
      const profilePath = initialData.role === "ADMIN" ? "/admin/profile" : "/manager/profile";
      navigate(profilePath);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Editar Perfil</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Nome
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
            Senha Atual (apenas se for alterar a senha)
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.currentPassword ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-red-500 text-sm">{errors.currentPassword}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Nova Senha (deixe em branco para manter a atual)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => {
              const profilePath = initialData.role === "ADMIN" ? "/admin/profile" : "/manager/profile";
              navigate(profilePath);
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm; 