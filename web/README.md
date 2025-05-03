# SoftwareScan Web Application

## Visão Geral

Este é o frontend web do sistema SoftwareScan, uma aplicação para gerenciamento de operadores, polígonos e interações.

## Reorganização do Projeto - Abril 2024

O projeto web foi completamente reorganizado seguindo uma arquitetura baseada em features, o que proporciona diversos benefícios:

### Nova Estrutura

```
src/
├── features/               # Organização baseada em domínios de negócios
│   ├── auth/               # Tudo relacionado a autenticação
│   │   ├── components/     # Componentes específicos de auth
│   │   ├── hooks/          # Hooks específicos de auth
│   │   ├── types/          # Tipos e interfaces de auth
│   │   └── utils/          # Utilidades específicas de auth
│   ├── profile/            # Gerenciamento de perfil
│   ├── tags/               # Gerenciamento de tags
│   ├── operators/          # Gerenciamento de operadores
│   ├── polygons/           # Gerenciamento de polígonos
│   ├── institutions/       # Gerenciamento de instituições
│   ├── managers/           # Gerenciamento de gerentes
│   ├── notifications/      # Sistema de notificações
│   └── common/             # Componentes e funcionalidades comuns
├── pages/                  # Páginas apenas como contêineres
├── layouts/                # Layouts reutilizáveis
├── components/             # Componentes UI genéricos
├── services/               # Serviços compartilhados
└── hooks/                  # Hooks globais (re-exportações)
```

### Benefícios Implementados

1. **Melhor Organização**: Código agrupado por domínio de negócio, não por tipo técnico
2. **Maior Coesão**: Todos os arquivos relacionados a uma feature ficam juntos
3. **Melhor Encapsulamento**: Cada feature pode encapsular sua própria lógica
4. **Facilidade de Manutenção**: Mais fácil encontrar os arquivos relacionados
5. **Reusabilidade**: Componentes e hooks encapsulados e reutilizáveis
6. **Separação de Responsabilidades**: Páginas apenas como contêineres, com lógica em hooks
7. **Tipagem Forte**: Tipos organizados por domínio para melhor reutilização

### Componentes Destacados

- Componentização completa do sistema de autenticação
- Hooks customizados para each feature (useAuth, useTags, useProfile, useOperators, usePolygons)
- Tipos fortemente tipados para todas as entidades
- Layouts reutilizáveis para estruturas comuns
- Componentes quebrados em partes menores e mais gerenciáveis

Esta reorganização torna o código mais modular, testável e escalável, permitindo um desenvolvimento futuro mais organizado e eficiente.

## Principais Melhorias

1. **Organização Baseada em Features**: Agrupamento de código relacionado por funcionalidade
2. **Componentização**: Arquivos grandes foram divididos em componentes menores e mais gerenciáveis
3. **Tipagem Forte**: Tipos e interfaces bem definidos para cada domínio
4. **Hooks Customizados**: Lógica de estado e efeitos extraída para hooks reutilizáveis
5. **Layouts Reutilizáveis**: Padrões de layout consistentes em toda a aplicação
6. **Melhor Separação de Responsabilidades**: Cada componente tem uma única responsabilidade
7. **Rotas Organizadas**: Sistema de rotas mais limpo e fácil de gerenciar

## Componentes Reutilizáveis

### Polígonos
- `MapLoader`: Componente para indicar carregamento do mapa
- `PolygonDrawingGuide`: Guia para desenho de polígonos
- `PolygonList`: Lista de polígonos
- `ExportMapControls`: Controles de exportação do mapa
- `DrawingControls`: Controles para desenho de polígonos
- `FilterControls`: Controles de filtro para polígonos
- `MapComponent`: Componente principal do mapa

### Operadores
- `OperatorList`: Lista de operadores
- `OperatorDetails`: Detalhes de um operador
- `OperatorForm`: Formulário para edição de operadores
- `OperatorSearch`: Busca de operadores
- `Pagination`: Componente de paginação

## Hooks

- `usePolygons`: Gerencia o estado e operações de polígonos
- `useOperators`: Gerencia o estado e operações de operadores

## Páginas

- `PolygonManagementPage`: Página de gerenciamento de polígonos
- `OperatorManagementPage`: Página de gerenciamento de operadores

## Tecnologias Utilizadas

- React
- TypeScript
- React Router
- Tailwind CSS
- React Hot Toast
- Google Maps API

## Como Executar

```bash
# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento
npm run dev

# Construir para produção
npm run build
```

---

## **Documentação da Parte Web - Softwarescan**

### **Visão Geral do Projeto**

A parte web do Softwarescan é composta por uma aplicação React que permite aos administradores e gerentes da plataforma gerenciar interações, tags, usuários, e polígonos, além de fornecer funcionalidades de login, recuperação de senha e visualização de dados no mapa. A aplicação usa o `Vite` como bundler e `TailwindCSS` para estilização.

### **Estrutura de Pastas**

A estrutura de pastas do projeto está organizada de maneira a facilitar o desenvolvimento e manutenção:

```
web/
├── dist/                # Pasta de build
├── node_modules/        # Dependências do projeto
├── public/              # Arquivos públicos (ex: imagens, favicon)
└── src/                 # Código-fonte da aplicação
    ├── assets/          # Imagens, fontes e outros arquivos estáticos
    ├── components/      # Componentes reutilizáveis da interface
    ├── hooks/           # Hooks personalizados
    ├── lib/             # Funções auxiliares
    ├── pages/           # Páginas da aplicação
    ├── services/        # Interação com APIs
    ├── types/           # Definições de tipos TypeScript
    ├── utils/           # Funções utilitárias
    ├── App.tsx          # Componente principal da aplicação
    ├── index.css        # Estilos globais
    ├── main.tsx         # Ponto de entrada da aplicação
    └── vite.config.ts   # Configuração do Vite
```

### **Tecnologias e Dependências**

#### **Dependências Principais:**

- **React**: Biblioteca JavaScript para a criação de interfaces de usuário.
- **Vite**: Bundler de aplicativos web rápido e de próxima geração.
- **TailwindCSS**: Framework CSS utilitário para estilização responsiva.
- **Axios**: Cliente HTTP para fazer requisições à API.
- **React Router DOM**: Biblioteca para navegação entre páginas.
- **Leaflet**: Biblioteca JavaScript para mapas interativos.
- **zustand**: Gerenciamento de estado simples e leve.
- **Lucide React**: Ícones utilizados na interface.

#### **Dependências de Desenvolvimento:**

- **ESLint**: Ferramenta para análise de código e manutenção de estilo.
- **TypeScript**: Superconjunto do JavaScript que adiciona tipagem estática.
- **Vite Plugin React**: Suporte a React com o Vite.

### **Componentes Principais**

#### **1. App.tsx**
Este é o componente principal que contém a estrutura de navegação e controle de autenticação. Ele verifica se o usuário está autenticado e redireciona para a tela de login caso contrário.

#### **2. Login e Recuperação de Senha**
- **Login.tsx**: Tela de login para que usuários ADMIN ou MANAGER acessem a plataforma.
- **PasswordRecoveryRequestScreen.tsx**: Tela para solicitar recuperação de senha.
- **PasswordResetScreen.tsx**: Tela para redefinir a senha após a verificação do código.
- **PasswordResetCodeVerificationScreen.tsx**: Tela para verificar o código enviado para recuperação de senha.
- **PasswordRecoverySuccessScreen.tsx**: Tela que confirma o envio do e-mail de recuperação.

#### **3. Páginas de Administração**
- **ProfileAdmin.tsx**: Exibe as informações do administrador, com a opção de editar o perfil.
- **TagManagement.tsx**: Permite a criação, edição e exclusão de tags utilizadas nas interações.
- **PolygonManagement.tsx**: Permite a visualização e o gerenciamento de polígonos no mapa.

#### **4. Mapas**
A funcionalidade de mapa é baseada no `Leaflet` para a visualização geográfica das interações. Também há a capacidade de desenhar e salvar polígonos, além de associar interações a esses polígonos.

#### **5. Navbar.tsx**
Componente de navegação que contém links para as páginas de administração, gerenciamento de tags, e logout. Ele também exibe notificações para o usuário.

### **Fluxo da Aplicação**

1. **Autenticação**: A aplicação começa com o componente `App.tsx`, que verifica se há um token válido no armazenamento local. Se não houver token, o usuário é redirecionado para a tela de login.
   
2. **Login**: O usuário insere suas credenciais na tela de login, e a aplicação faz uma requisição para a API para autenticar o usuário. Se bem-sucedido, o token e as informações do usuário são armazenados no `localStorage`.

3. **Gerenciamento de Tags e Polígonos**: O administrador pode criar, editar e excluir tags através da página `TagManagement.tsx`. Além disso, ele pode gerenciar polígonos na página `PolygonManagement.tsx`, incluindo a criação de novos polígonos interativos no mapa.

4. **Interações**: O administrador pode visualizar interações e associá-las a tags específicas. As interações são exibidas com a capacidade de filtragem por tags, rankings, e instituições. O gerenciamento de interações inclui funcionalidades como aprovação, rejeição e exclusão de interações.

5. **Notificações**: O sistema de notificações exibe alertas em tempo real sobre ações pendentes e mudanças de status nas interações.

6. **Mapas**: A página de gerenciamento de polígonos permite a visualização interativa no mapa. O administrador pode desenhar novos polígonos e associar interações a eles, ou importar polígonos de arquivos shapefile.

### **Comunicação com a API**

A comunicação com a API é feita principalmente através do `axios`, e as chamadas são feitas em várias páginas/componentes:

- **Autenticação**: O login e a recuperação de senha utilizam endpoints específicos para autenticar e atualizar a senha do usuário.
- **Interações e Tags**: As tags e interações são gerenciadas utilizando endpoints de criação, atualização, exclusão e filtragem.
- **Polígonos**: A criação e exclusão de polígonos, bem como a associação de interações a polígonos, são realizadas por meio de endpoints dedicados.

### **Configurações de Ambiente**

- **.env**: O arquivo de configuração contém a URL da API (`VITE_API_URL`) e a chave da API do Google Maps (`VITE_GOOGLE_MAPS_API_KEY`), necessárias para a comunicação com a API e a integração do mapa.

### **Desenvolvimento e Execução**

#### **Para rodar o projeto localmente:**

1. **Instalar dependências**:
   ```
   pnpm install
   ```

2. **Executar o servidor de desenvolvimento**:
   ```
   pnpm dev
   ```

3. **Abrir o navegador** e acessar `http://localhost:3000`.

#### **Scripts no `package.json`:**
- `dev`: Inicia o servidor de desenvolvimento com Vite.
- `build`: Compila o projeto para produção.
- `lint`: Executa o ESLint para verificação do código.
- `preview`: Exibe o projeto em um ambiente de pré-visualização.

### **Conclusão**

A parte web do Softwarescan proporciona uma interface intuitiva para gerenciar interações, usuários, tags e polígonos de maneira eficiente. A arquitetura do sistema foi projetada para facilitar a adição de novas funcionalidades e garantir uma experiência de usuário consistente. Com base em React, Vite, e TailwindCSS, a aplicação é moderna e responsiva.

---

## Organização do Projeto

A estrutura do projeto segue uma arquitetura Feature-First para facilitar a manutenção e escalabilidade:

```
web/src/
├── assets/              # Recursos estáticos globais
├── features/            # Módulos de funcionalidades organizados por domínio
│   ├── auth/
│   │   ├── components/  # Componentes específicos de autenticação
│   │   ├── hooks/       # Hooks específicos de autenticação
│   │   ├── services/    # Serviços específicos de autenticação
│   │   ├── types/       # Tipos específicos de autenticação
│   │   └── utils/       # Utilitários específicos de autenticação
│   ├── operators/
│   ├── polygons/
│   └── etc...
├── lib/                 # Bibliotecas, configurações e adaptadores
├── shared/              # Componentes e utilidades compartilhadas entre features
│   ├── components/      # Componentes reutilizáveis
│   ├── hooks/           # Hooks reutilizáveis
│   ├── services/        # Serviços compartilhados
│   ├── types/           # Tipos globais
│   └── utils/           # Utilitários globais
└── pages/               # Apenas páginas que compõem as features
```

### Princípios da Organização

1. **Feature-First**: Cada funcionalidade do sistema possui sua própria pasta com todos os componentes, hooks, serviços e tipos necessários.

2. **Coesão por Feature**: Arquivos relacionados a uma mesma funcionalidade ficam juntos, facilitando a navegação e manutenção.

3. **Componentes Compartilhados**: Componentes usados por múltiplas features ficam em `shared/components`.

4. **Tipos Compartilhados**: Tipos globais que podem ser usados por várias features ficam em `shared/types`.

5. **Serviços Globais**: Serviços usados por múltiplas features ficam em `shared/services`.

### Como Contribuir

Ao adicionar novas funcionalidades ou modificar existentes, siga estas diretrizes:

1. **Localização de Novos Arquivos**:
   - Se está criando algo específico para uma feature, adicione na pasta dessa feature.
   - Se está criando algo que será usado por várias features, adicione na pasta `shared`.

2. **Importações**:
   - Use importações relativas dentro da mesma feature.
   - Use importações absolutas para recursos compartilhados.

3. **Nomeação**:
   - Use nomes descritivos e consistentes.
   - Prefira nomes no singular para pastas (ex: `feature/`, não `features/`).

4. **Componentes**:
   - Componentes devem ser exportados com nome.
   - Cada componente deve ter sua própria pasta com arquivo index.ts para exportação.

5. **Hooks**:
   - Hooks personalizados devem começar com "use".
   - Cada hook deve ter um único propósito.

6. **Tipos**:
   - Tipos devem ser exportados de arquivos `.ts` separados.
   - Interfaces devem começar com "I" (ex: `IUser`).

---
