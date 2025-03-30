Aqui está a documentação completa com a observação sobre os controllers e serviços que utilizam serviços externos:

---

# Documentação Backend - Plataforma Scan

## Visão Geral

O backend da Plataforma Scan é uma API RESTful construída com **Node.js**, **Express**, **TypeScript** e **Prisma ORM** para interagir com um banco de dados MongoDB. O sistema é responsável por gerenciar usuários (como operadores, gerentes e administradores), posts, notificações, integrações com serviços externos como o Google Maps e AWS S3, e autenticação/segurança.

## Estrutura de Pastas

A estrutura de pastas do projeto é organizada da seguinte maneira:

```plaintext
backend/
│
├── api/
│   ├── app.ts               # Arquivo principal de configuração do servidor
│   ├── node_modules/        # Dependências do projeto
│
├── prisma/
│   └── schema.prisma        # Arquivo de definição do banco de dados com Prisma
│
├── src/
│   ├── assets/              # Arquivos estáticos
│   ├── controllers/         # Lógicas de controle para endpoints
│   ├── middlewares/         # Middlewares de autenticação e autorização
│   ├── routes/              # Arquivo de rotas da API
│   ├── service/             # Serviços de manipulação de dados
│   └── storage/             # Configurações do armazenamento (AWS S3)
│
├── .env                     # Variáveis de ambiente para configurações sensíveis
├── package.json             # Dependências e scripts do projeto
└── tsconfig.json            # Configuração do TypeScript
```

## Arquivos Importantes

### 1. **app.ts**

O arquivo principal do servidor que configura o **Express**, gerencia as rotas e implementa o tratamento de erros.

- **Rotas**:
  - `/auth`: Rota para autenticação de usuários (login e registro).
  - `/operator`: Rotas para operadores, incluindo criação e gerenciamento de posts.
  - `/admin`: Rota de administração, usada para aprovar, rejeitar e listar operadores.
  - `/manager`: Rotas de gerenciamento para gerentes.
  - `/posts`: Gerenciamento de posts.
  - `/tags`: Gerenciamento de tags associadas aos posts.
  - `/polygons`: Gerenciamento de polígonos associados aos posts.
  - **Google Maps API**: Endpoint para gerar a URL da API do Google Maps com a chave de API configurada.

### 2. **.env**

O arquivo `.env` é utilizado para armazenar configurações sensíveis, como credenciais de bancos de dados, chaves de API e configurações de e-mail.

#### Exemplo de `.env`:

```env
# Banco de Dados MongoDB
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority"

# Chave secreta para JWT
SECRET_KEY_SESSION="replace_this_with_a_secure_random_string"

# Configurações de E-mail
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"

# AWS S3 Configurações
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET_NAME="your-s3-bucket-name"

# Chave da API do Google Maps
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

#### Como Configurar as Variáveis:

- **DATABASE_URL**: Obtenha a URL de conexão do **MongoDB Atlas**. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) e crie um cluster para obter a URL de conexão.
- **SECRET_KEY_SESSION**: Gere uma chave segura utilizando ferramentas como [RandomKeygen](https://randomkeygen.com/).
- **EMAIL_USER e EMAIL_PASS**: Use um e-mail de serviço como o **Gmail** e configure uma senha de aplicativo [Google Account - App Passwords](https://myaccount.google.com/apppasswords).
- **AWS Configurações**: Obtenha as credenciais de acesso através do [AWS IAM](https://console.aws.amazon.com/iam/home) e crie um bucket no **AWS S3**.
- **GOOGLE_MAPS_API_KEY**: Obtenha a chave de API do [Google Cloud Console](https://console.cloud.google.com/) para utilizar os serviços de Maps, Geocoding e Places.

### 3. **services/authService.ts**

Este serviço contém a lógica de autenticação e gestão de usuários, incluindo funções de login, registro e recuperação de senha.

- **Funções**:
  - **registerUser**: Registra um novo usuário, realizando validação de código de verificação e envio de e-mail de confirmação.
  - **loginUser**: Realiza o login do usuário, validando as credenciais e gerando um **JWT** (JSON Web Token) para autenticação.
  - **generateResetPasswordCode**: Gera um código de redefinição de senha e o envia para o e-mail do usuário.
  - **resetPassword**: Permite redefinir a senha de um usuário, após validação do código de redefinição.

### 4. **services/expoNotification.ts**

Este serviço integra com a **Expo Push Notification** API para enviar notificações push para os dispositivos dos usuários.

- **Função**:
  - **sendExpoPushNotification**: Envia notificações push para dispositivos registrados via Expo, como notificações de aprovação, rejeição e atualização de status da conta.

### 5. **services/mailer.ts**

Este serviço é responsável pelo envio de e-mails para usuários utilizando **Nodemailer**.

- **Funções**:
  - **sendVerificationEmail**: Envia um e-mail com o código de verificação para o usuário.
  - **sendWelcomeEmail**: Envia um e-mail de boas-vindas após o registro do usuário.
  - **sendResetPasswordEmail**: Envia um e-mail com o código de redefinição de senha.
  - **sendPendingApprovalEmail**: Notifica o usuário sobre o status pendente de aprovação.

### 6. **middlewares/authMiddleware.ts**

Middlewares para proteger as rotas de autenticação e autorização.

- **Funções**:
  - **authMiddleware**: Verifica se o usuário está autenticado, validando o token JWT enviado no cabeçalho da requisição.
  - **roleMiddleware**: Verifica se o usuário tem a permissão necessária (com base na função do usuário) para acessar determinados recursos.

### 7. **controllers/adminController.ts**

Controlador que gerencia operações de administração, como aprovação, rejeição e listagem de operadores pendentes.

- **Funções**:
  - **listPendingOperators**: Lista todos os operadores pendentes de aprovação.
  - **approveOperator**: Aprova um operador, envia um e-mail de boas-vindas e notificação push.
  - **rejectOperator**: Rejeita um operador, exclui os posts e envia notificação de rejeição.
  - **deleteExpiredOperators**: Deleta operadores cuja solicitação expirou.
  - **listAllOperators**: Lista todos os operadores aprovados e ativos.

### 8. **controllers/postController.ts**

Controlador que gerencia posts de operadores.

- **Funções**:
  - **createPost**: Cria um novo post, validando o limite diário de imagens.
  - **listUserPosts**: Lista todos os posts de um operador específico.
  - **getPostById**: Recupera os dados de um post específico.
  - **deletePost**: Deleta um post e a imagem associada no AWS S3.
  - **listAllPosts**: Lista todos os posts criados na plataforma.

## Serviços Externos

### 1. **Google Maps API**
- **Função**: Integrada para geolocalização e visualização de mapas.
- **Configuração**: Acesse o [Google Cloud Console](https://console.cloud.google.com/) e obtenha uma chave de API.

### 2. **AWS S3**
- **Função**: Armazenamento de imagens e arquivos no serviço de nuvem da AWS.
- **Configuração**: Acesse o [AWS Management Console](https://aws.amazon.com/), crie um bucket S3 e gere suas credenciais de acesso.

## Observação

Alguns **controllers** e **serviços** foram mencionados acima porque utilizam **serviços externos**, como o envio de notificações via **Expo Push** e o armazenamento de arquivos na **AWS S3**, bem como o uso da **Google Maps API** para funcionalidades de geolocalização e visualização de mapas. Essas integrações são essenciais para o funcionamento completo da plataforma, especialmente para notificações de status e gerenciamento de imagens e geolocalização.

## Conclusão

Este projeto backend gerencia todos os aspectos do sistema **Plataforma Scan**, incluindo a autenticação de usuários, manipulação de posts, integrações com serviços externos e notificações push. O sistema é flexível e permite que diferentes tipos de usuários (administradores, gerentes e operadores) interajam de maneira eficiente.

---