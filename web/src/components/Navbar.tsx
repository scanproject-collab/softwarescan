import React from 'react';
import { Bell, Menu } from 'lucide-react'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between bg-blue-900 px-4 py-3 text-white">
      {/* Ícone de hambúrguer com dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none">
            <Menu className="h-6 w-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 ml-10">
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logo centralizado */}
      <div className="flex items-center gap-2">
        <img
          src="/scan-removebg-preview.png"
          alt="Scan Logo"
          className="h-12 w-12"
        />
        <h1 className="text-lg font-bold">Scan</h1>
      </div>

      {/* Ícone de sino */}
      <button className="focus:outline-none">
        <Bell className="h-6 w-6" />
      </button>
    </nav>
  );
};

export default Navbar;