import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useProfile } from "../hooks/useProfile";
import MainLayout from "../../../layouts/MainLayout";
import ProfileDisplay from "./ProfileDisplay";

const ProfileScreen: React.FC = () => {
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
      <div className="flex flex-col bg-gray-100 min-h-screen">
        <Toaster position="top-right" />
        <ProfileDisplay profile={user} />
      </div>
    </MainLayout>
  );
};

export default ProfileScreen; 