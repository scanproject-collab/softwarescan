import React from "react";
import { Bell, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setAuthToken, user } = useAuth();

  const handleLogout = () => {
    console.log("Tentando fazer logout...");
    setAuthToken(null);
    console.log("Logout iniciado, redirecionamento será gerenciado pelo useAuth");
  };

  const handleHomeClick = () => {
    if (pathname !== "/") {
      navigate("/");
    }
  };

  return (
      <nav className="flex items-center justify-between bg-blue-900 px-4 py-3 text-white">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 ml-10">
            <DropdownMenuLabel>Olá, {user?.name || "Usuário"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pathname !== "/" && (
                <DropdownMenuItem
                    onClick={handleHomeClick}
                    className="cursor-pointer hover:bg-gray-100"
                >
                  Home
                </DropdownMenuItem>
            )}
            <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer hover:bg-gray-100"
            >
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => navigate("/admin/tags")}
                className="cursor-pointer hover:bg-gray-100"
            >
              Gerenciar Tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 hover:bg-red-100"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <img
              src="/scan-removebg-preview.png"
              alt="Scan Logo"
              className="h-12 w-12"
          />
          <h1 className="text-lg font-bold">Scan</h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="focus:outline-none">
            <Bell className="h-6 w-6 text-white" />
          </button>
        </div>
      </nav>
  );
};

export default Navbar;