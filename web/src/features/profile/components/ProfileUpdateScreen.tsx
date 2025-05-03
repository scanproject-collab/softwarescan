import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useProfile } from "../hooks/useProfile";
import MainLayout from "../../../layouts/MainLayout";
import ProfileForm from "./ProfileForm";

const ProfileUpdateScreen: React.FC = () => {
  const { user } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="flex flex-col bg-gray-100 min-h-screen py-8">
        <Toaster position="top-right" />
        <h1 className="text-2xl font-bold text-center mb-6">Atualizar Perfil</h1>
        <ProfileForm initialData={user} />
      </div>
    </MainLayout>
  );
};

export default ProfileUpdateScreen; 