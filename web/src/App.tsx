import React from 'react';
import Navbar from './components/Navbar';
import { CheckCircle, XCircle } from 'lucide-react';
import logo from "/scan-removebg-preview.png";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <img
            src={logo}
            alt="PMAL Logo"
            className="h-16 w-16"
          />
          <div>
            <h1 className="text-2xl font-bold">
              Projeto Ações Solidárias - DINT PMAL
            </h1>
            <p className="text-gray-600">Descrição do Ações Solidárias...</p>
          </div>
        </div>

        {/* Vínculos e Últimas Interações */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Seção Vínculos */}
          <div className="col-span-1 rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Vínculos</h2>
              <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                Ver tudo
              </button>
            </div>

            {/* Gestor */}
            <div className="mb-4 flex items-center gap-2 rounded bg-blue-50 p-3">
              <div className="h-10 w-10 rounded-full bg-gray-300" />
              <div>
                <p className="font-medium">Gestor</p>
                <p className="text-sm text-gray-600">DINT PMAL</p>
              </div>
            </div>

            {/* Aprovações pendentes */}
            <div>
              <h3 className="mb-2 font-semibold">Aprovações pendentes</h3>
              <div className="mb-2 flex items-center justify-between rounded bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-300" />
                  <p>Fulano - DINT PMAL</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-green-500">
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button className="text-red-500">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-300" />
                  <p>Cicrano - DINT PMAL</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-green-500">
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button className="text-red-500">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Botão Ver no mapa */}
            <button className="mt-4 w-full rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
              Ver no mapa
            </button>
          </div>

          {/* Seção Últimas Interações */}
          <div className="col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Últimas interações</h2>
              <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                Ver tudo
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Card de interação */}
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-lg bg-white p-4 shadow">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-center leading-8 text-blue-600">
                      A
                    </div>
                    <p className="font-medium">Interação</p>
                  </div>
                  <div className="mb-4 h-24 rounded bg-gray-200" />
                  <p className="text-sm text-gray-600">Data e hora</p>
                  <p className="text-sm text-gray-600">Tipos de interação</p>
                  <p className="text-sm text-gray-600">Observações</p>
                  <div className="mt-4 flex gap-2">
                    <button className="w-full rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                      Editar
                    </button>
                    <button className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;