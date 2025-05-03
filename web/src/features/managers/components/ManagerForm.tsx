import React, { useState } from 'react';
import { Institution } from '../../institutions/types/institutions';
import { CreateManagerDto } from '../types/managers';

interface ManagerFormProps {
  institutions: Institution[];
  isCreating: boolean;
  onSubmit: (data: CreateManagerDto) => void;
  onCancel: () => void;
}

/**
 * Componente de formulário para criação de gerentes
 */
export const ManagerForm: React.FC<ManagerFormProps> = ({
  institutions,
  isCreating,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return;
    }

    onSubmit({
      name,
      email,
      password,
      institutionId: selectedInstitution || undefined,
      role: 'MANAGER',
    });

    // Reset form
    setName('');
    setEmail('');
    setPassword('');
    setSelectedInstitution('');
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold text-gray-800">Criar Novo Gerente</h2>
      <form onSubmit={handleSubmit}>
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

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-gray-300 px-4 py-2 font-bold text-gray-700 hover:bg-gray-400"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isCreating}
            className={`rounded-md bg-orange-400 px-4 py-2 font-bold text-white hover:bg-orange-500 ${isCreating ? "opacity-70" : ""
              }`}
          >
            {isCreating ? "Criando..." : "Criar Gerente"}
          </button>
        </div>
      </form>
    </div>
  );
};
