Perfeito! Vamos começar com o **README do Backend**.

### **1. README do Backend (`scan-backend/README.md`)**

```markdown
# Scan Backend

Este repositório contém o backend da aplicação **Scan**, que fornece a API para gerenciamento de interações, usuários e geolocalização de eventos.

## Tecnologias Utilizadas

- **Node.js** com **TypeScript**
- **Firebase** para autenticação, banco de dados em tempo real e notificações.
- **Express** para criação da API REST.
- **CORS** para permitir comunicação entre o frontend e o backend.
- **MVC** (Model-View-Controller) para organização do código.

## Funcionalidades

- **Gerenciamento de Usuários**: Criação, edição e remoção de contas de operadores e administradores.
- **Autenticação com Firebase**: Login e autenticação de usuários com o Firebase Authentication.
- **Gerenciamento de Interações**: Os operadores podem registrar, editar e excluir interações (fotos, data, hora, localização) em até 15 minutos.
- **Mapas Interativos**: Pontuação das interações exibida em mapas, com filtros de data, tipo de interação e área.

## Como Rodar o Projeto

### Requisitos:
- **Node.js** (versão >= 16.x)
- **Firebase**: Configuração no console do Firebase.

### Passos para rodar:

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/scan-backend.git
   cd scan-backend
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   ```

3. Crie um arquivo `.env` e adicione as credenciais do Firebase:
   ```plaintext
   FIREBASE_API_KEY=your-firebase-api-key
   FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
   FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
   FIREBASE_APP_ID=your-firebase-app-id
   ```

4. Inicie o servidor:
   ```bash
   pnpm start
   ```

5. O servidor estará rodando em `http://localhost:3000`.

## Estrutura do Código

- **src/controllers/**: Controladores responsáveis pelas ações da API.
- **src/models/**: Modelos que representam a estrutura dos dados e interagem com o Firebase.
- **src/routes/**: Definições das rotas da API.

## Como Contribuir

1. Faça um fork deste repositório.
2. Crie uma branch para sua funcionalidade: `git checkout -b feature/nome-da-funcionalidade`.
3. Comite suas alterações: `git commit -am 'Adiciona nova funcionalidade'`.
4. Push para a branch: `git push origin feature/nome-da-funcionalidade`.
5. Abra um Pull Request.

```
