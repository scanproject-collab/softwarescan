import authRoutes from './authRoutes';
import operatorRoutes from './operatorRoutes';
import adminRoutes from './adminRoutes';
import managerRoutes from './managerRoutes';
import institutionRoutes from './institutionRoutes';
import postRoutes from './postRoutes';
import tagRoutes from './tagRoutes';
import polygonsRoutes from './polygonsRoutes';

/**
 * Rotas da API
 * 
 * Todas as rotas seguem um padrão RESTful com documentação OpenAPI
 * Os endpoints são organizados por recursos e funções:
 * 
 * - /auth - Autenticação e gerenciamento de usuários
 * - /operators - Gerenciamento de operadores
 * - /admin - Funções administrativas
 * - /managers - Gerenciamento de gestores
 * - /institutions - Gerenciamento de instituições
 * - /posts - Gerenciamento de postagens
 * - /tags - Gerenciamento de tags
 * - /polygons - Gerenciamento de áreas geográficas
 */
export {
    authRoutes,
    operatorRoutes,
    adminRoutes,
    managerRoutes,
    institutionRoutes,
    postRoutes,
    tagRoutes,
    polygonsRoutes,
}