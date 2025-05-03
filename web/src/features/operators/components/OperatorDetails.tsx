import React, { useState } from 'react';
import { User, Clock, Activity, Building, Calendar, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { OperatorDetails as OperatorDetailsType } from '../types/operator.types';

interface OperatorDetailsProps {
  operator: OperatorDetailsType;
  isOperatorActive: (operator: any) => boolean;
  formatDate: (date: string) => string;
  getPostTags: (post: any) => string;
  onEdit: () => void;
  onDelete: () => void;
}

const OperatorDetails: React.FC<OperatorDetailsProps> = ({
  operator,
  isOperatorActive,
  formatDate,
  getPostTags,
  onEdit,
  onDelete
}) => {
  const [isPostsExpanded, setIsPostsExpanded] = useState(false);

  return (
    <div>
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex justify-between items-center">
        <h2 className="flex items-center">
          <Eye className="mr-2 h-5 w-5" />
          Detalhes do Operador
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors duration-150 flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors duration-150 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-start">
            <User className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
            <div>
              <p className="text-gray-600 text-sm">Nome:</p>
              <p className="font-medium text-gray-800">{operator.name}</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 h-5 w-5 mt-0.5 mr-2">@</span>
            <div>
              <p className="text-gray-600 text-sm">Email:</p>
              <p className="font-medium text-gray-800">{operator.email}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Activity className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
            <div>
              <p className="text-gray-600 text-sm">Status:</p>
              <div className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${isOperatorActive(operator) ? 'bg-green-500' : 'bg-red-500'
                    }`}
                ></span>
                <p
                  className={`font-medium ${isOperatorActive(operator) ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {isOperatorActive(operator) ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-start">
            <Building className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
            <div>
              <p className="text-gray-600 text-sm">Instituição:</p>
              <p className="font-medium text-gray-800">
                {typeof operator.institution === 'object'
                  ? operator.institution.title
                  : operator.institution}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
            <div>
              <p className="text-gray-600 text-sm">Cadastrado em:</p>
              <p className="font-medium text-gray-800">{formatDate(operator.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
            <div>
              <p className="text-gray-600 text-sm">Último acesso:</p>
              <p className="font-medium text-gray-800">
                {operator.lastLoginDate ? formatDate(operator.lastLoginDate) : 'Nunca acessou'}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <FileText className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
            <div>
              <p className="text-gray-600 text-sm">Total de Posts:</p>
              <p className="font-medium text-gray-800">{operator.postsCount}</p>
            </div>
          </div>
        </div>

        {/* Posts do Operador */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Posts do Operador
            </h3>
            <button
              onClick={() => setIsPostsExpanded(!isPostsExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {isPostsExpanded ? 'Mostrar menos' : 'Expandir todos'}
            </button>
          </div>
          {operator.posts && operator.posts.length > 0 ? (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Localização
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Ranking
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {operator.posts.map((post) => (
                      <React.Fragment key={post.id}>
                        <tr className="hover:bg-gray-50 cursor-pointer">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{post.title}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(post.createdAt)}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {getPostTags(post)}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {post.location || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeof post.ranking === 'string' &&
                                  post.ranking === 'Alto'
                                  ? 'bg-red-100 text-red-800'
                                  : typeof post.ranking === 'string' &&
                                    post.ranking === 'Médio'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                            >
                              {typeof post.ranking === 'object'
                                ? post.ranking.title || 'N/A'
                                : post.ranking || 'Baixo'}
                            </span>
                          </td>
                        </tr>
                        {isPostsExpanded && post.content && (
                          <tr className="bg-gray-50">
                            <td colSpan={5} className="py-2 px-4">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Conteúdo:</span>{' '}
                                {post.content}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum post encontrado para este operador.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperatorDetails; 