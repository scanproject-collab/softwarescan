import React from "react";
import { useNavigate } from "react-router-dom";
import { ProfileData } from "../types/profile.types";

interface ProfileDisplayProps {
  profile: ProfileData;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile }) => {
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não disponível";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getEditPath = () => {
    return profile.role === "ADMIN" ? "/admin/update" : "/manager/update";
  };

  return (
    <div className="flex flex-col items-center p-8">
      <div className="w-24 h-24 bg-blue-500 text-white flex items-center justify-center text-4xl font-bold rounded-full">
        {profile.name.charAt(0).toUpperCase()}
      </div>
      <h1 className="mt-4 text-2xl font-semibold">{profile.name}</h1>

      <div className="mt-6 w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-700"><strong>Email:</strong> {profile.email || "Não informado"}</p>
        <p className="text-gray-700 mt-2">
          <strong>Instituição:</strong> {profile.institution?.title || "Instituição Não Informada"}
        </p>
        <p className="text-gray-700 mt-2">
          <strong>Data de Criação:</strong> {formatDate(profile.createdAt)}
        </p>
        <p className="text-gray-700 mt-2">
          <strong>Função:</strong> {profile.role}
        </p>
      </div>

      <button
        onClick={() => navigate(getEditPath())}
        className="mt-6 px-6 py-2 bg-blue-900 text-white rounded-md text-lg font-semibold transition-colors duration-200 hover:bg-blue-600"
      >
        Editar Perfil
      </button>
    </div>
  );
};

export default ProfileDisplay; 