import React from 'react';
import { FormData } from '../types/operator.types';
import { Loader } from 'lucide-react';

interface Institution {
  id: string;
  title: string;
}

interface OperatorFormProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
  institutions?: Institution[];
  selectedInstitution?: string;
  handleInstitutionChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isAdmin?: boolean;
  isEditing?: boolean;
}

const OperatorForm: React.FC<OperatorFormProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  loading,
  onCancel,
  institutions = [],
  selectedInstitution = '',
  handleInstitutionChange,
  isAdmin = false,
  isEditing = false
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Nome:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          {isEditing ? 'Nova Senha (opcional):' : 'Senha:'}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={isEditing ? "Deixe em branco para manter a senha atual" : ""}
          required={!isEditing}
        />
      </div>

      {/* Institution select for admin users only */}
      {isAdmin && (
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Instituição:</label>
          <select
            name="institutionId"
            value={selectedInstitution}
            onChange={handleInstitutionChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione uma instituição</option>
            {institutions.map(institution => (
              <option key={institution.id} value={institution.id}>
                {institution.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
          id="isActive"
        />
        <label htmlFor="isActive" className="text-gray-700 font-semibold">
          Conta Ativa
        </label>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-150"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-2" />
              {isEditing ? 'Salvando...' : 'Criando...'}
            </>
          ) : (
            isEditing ? 'Salvar' : 'Criar'
          )}
        </button>
      </div>
    </form>
  );
};

export default OperatorForm; 