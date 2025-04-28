
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
