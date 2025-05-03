import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Página não encontrada</h2>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          A página que você está procurando pode ter sido removida, renomeada
          ou está temporariamente indisponível.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 