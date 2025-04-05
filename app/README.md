
---

# Documentação do Projeto - **Softwarescan**

## Visão Geral

O **Softwarescan** é um projeto que visa a criação de uma plataforma onde usuários podem registrar interações, visualizar posts e interagir com outros participantes. Ele é composto por um aplicativo móvel desenvolvido em **React Native** com **Expo** e uma API que gerencia a autenticação de usuários, o armazenamento de dados e o envio de notificações. A plataforma permite a recuperação de senhas, a definição de locais no mapa e a exibição de interações em forma de posts.

---

## Estrutura do Projeto

### Estrutura de Pastas

```plaintext
├── app
│   ├── assets/
│   ├── (tabs)/
│   ├── components/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── posts/
│   ├── pages/
│   ├── utils/
├── .env
├── .env.example
├── app.json
├── eas.json
└── package.json
```

### Descrição das Pastas e Arquivos

- **app**: Contém a lógica principal do aplicativo, incluindo componentes reutilizáveis e telas.
  - **components**: Componentes divididos em diferentes funcionalidades como `auth`, `home`, `posts`.
  - **pages**: Contém as telas, incluindo telas de autenticação e de perfil.
  - **utils**: Funções auxiliares como manipulação de autenticação e notificações.

- **.env**: Contém as variáveis de ambiente do projeto, como URLs da API e chaves de API.
- **app.json**: Arquivo de configuração do Expo que define as configurações da aplicação.
- **eas.json**: Arquivo de configuração do EAS (Expo Application Services) para construir e submeter a aplicação.
- **package.json**: Gerenciador de dependências do projeto.

---

## Funcionalidades

### 1. **Autenticação**
   A autenticação no **Softwarescan** é feita através de **tokens JWT** que permitem o acesso à plataforma de forma segura. O fluxo de autenticação está dividido em:

   - **Registro de Usuário**: O usuário se registra fornecendo nome, e-mail e senha, com validação de código de verificação enviado por e-mail.
   - **Login**: Realiza-se a verificação do e-mail e senha, retornando um token JWT.
   - **Recuperação de Senha**: Envia-se um código de recuperação de senha para o e-mail, que o usuário usa para redefinir sua senha.

### 2. **Criação de Postagens**
   Usuários podem criar interações (postagens) que incluem:
   - Título, descrição, tags e localização.
   - A localização pode ser automática (com o uso do GPS) ou manual.
   - As imagens podem ser carregadas diretamente do dispositivo.
   - As postagens também podem ser salvas localmente para envio posterior quando o dispositivo estiver online.

### 3. **Exibição de Posts e Mapa**
   A plataforma permite a visualização de posts de outros usuários, com integração ao **Google Maps** para exibir a localização geográfica das interações registradas.

---

## Fluxo de Funcionalidades

### Fluxo de Autenticação

1. **Cadastro de Usuário**: Quando o usuário preenche o formulário de registro, um código de verificação é enviado para o e-mail. O usuário insere o código na plataforma, e, se validado, sua conta é criada.
   
2. **Login de Usuário**: Após o cadastro, o usuário realiza o login, e um **token JWT** é retornado. Este token é utilizado em todas as requisições subsequentes à API.

3. **Recuperação de Senha**: O usuário solicita uma redefinição de senha, e um código é enviado para o e-mail. O usuário insere o código e redefine sua senha.

### Fluxo de Postagem

1. **Criação de Post**: O usuário preenche os campos de título, descrição, tags e localização (automática ou manual) para criar um post.
   
2. **Visualização de Post**: Ao visualizar os posts, o aplicativo exibe os detalhes da postagem, como título, descrição e localização no mapa. 

3. **Exibição no Mapa**: Para interações com localização, o post é exibido no mapa com um marcador indicando a posição.

---

## **Integrações de Serviços Externos**

### 1. **Notificações via OneSignal e Expo**

A plataforma utiliza uma combinação de **OneSignal** e **Expo Notifications** para enviar notificações push para os usuários. O sistema funciona da seguinte forma:

- **OneSignal**: Serviço de notificações push cross-platform que permite o envio de notificações para dispositivos iOS e Android.
  - Utiliza um **App ID** único para identificar a aplicação dentro do painel do OneSignal.
  - Para dispositivos Android, requer o **Google Project Number** para comunicação com o Firebase Cloud Messaging (FCM).
  
- **Expo Notifications**: Integração nativa que facilita o registro do dispositivo para receber notificações.
  - O sistema registra o **playerId** (também conhecido como token do dispositivo) do usuário.
  - Este playerId é armazenado no servidor e utilizado para direcionar notificações para usuários específicos.

### 2. **Google Maps API**

A **API do Google Maps** é utilizada para geocodificar endereços e exibir a localização de posts no mapa. Os principais endpoints utilizados são:
- **Geocodificação**: Para converter um endereço em coordenadas geográficas.
- **Reverse Geocoding**: Para converter coordenadas em um endereço.

### 3. **AWS S3 para Armazenamento de Imagens**

Imagens de posts são armazenadas em um bucket do **AWS S3**, o que garante escalabilidade e alta disponibilidade para os arquivos.

---

## Variáveis de Ambiente

### `.env.example`

Este arquivo contém exemplos de variáveis de ambiente necessárias para rodar o projeto. Ao rodar o projeto, você precisa preencher essas variáveis com os valores corretos.

```plaintext
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_URL_LOCAL=http://localhost:3000
EXPO_PUBLIC_EAS_PROJECT_ID=your_eas_project_id_here
EXPO_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id_here
EXPO_ONESIGNAL_GOOGLE_PROJECT_NUMBER=your_google_project_number_here
```

Descrição das variáveis:
- `EXPO_PUBLIC_API_URL`: URL da API em produção
- `EXPO_PUBLIC_API_URL_LOCAL`: URL da API em ambiente local
- `EXPO_PUBLIC_EAS_PROJECT_ID`: ID do projeto no Expo Application Services
- `EXPO_PUBLIC_GOOGLE_API_KEY`: Chave da API do Google Maps para integração de mapas
- `EXPO_PUBLIC_ONESIGNAL_APP_ID`: ID da aplicação no OneSignal para notificações push
- `EXPO_ONESIGNAL_GOOGLE_PROJECT_NUMBER`: Número do projeto Google/Firebase para notificações no Android

---

## Estrutura do Banco de Dados

A estrutura do banco de dados é gerenciada pelo **Prisma**, que é uma ORM para Node.js. Abaixo estão as tabelas principais:

1. **Usuários** (`User`): Armazena as informações dos usuários, incluindo credenciais, status de aprovação e dados de login.
2. **Notificações** (`Notification`): Armazena as notificações enviadas para os usuários.
3. **Posts** (`Post`): Armazena os posts dos usuários, incluindo títulos, descrições, localização e tags.
4. **Tags** (`Tag`): Armazena as tags associadas aos posts para facilitar a filtragem e pesquisa.

---

## **Configuração de Desenvolvimento**

### Requisitos

- **Node.js**: 18.x.x
- **pnpm**: Gerenciador de pacotes preferido para este projeto
- **Expo CLI**: `pnpm install -g expo-cli`
- **Prisma**: `pnpm install @prisma/client`
- **AWS CLI**: Para configuração do bucket S3
- **Conta OneSignal**: Para configuração das notificações push

### Passos para Rodar o Projeto

1. **Instalar dependências**: Execute o comando abaixo para instalar as dependências do projeto.
   ```bash
   pnpm install
   ```

2. **Configuração do `.env`**: Preencha as variáveis de ambiente no arquivo `.env` com as chaves apropriadas. Certifique-se de incluir as chaves do OneSignal para as notificações funcionarem corretamente.

3. **Rodar o Backend**: Execute o backend utilizando o Prisma.
   ```bash
   pnpm run dev
   ```

4. **Rodar o Frontend**:
   - Para rodar o aplicativo no Android:
     ```bash
     pnpm start
     ```

   - Para rodar o aplicativo no iOS:
     ```bash
     pnpm run ios
     ```

5. **Construir para Produção**:
   - Para gerar o build para produção, execute o comando:
     ```bash
     eas build --platform all
     ```

---

## **Considerações Finais**

Essa documentação cobre o escopo geral do projeto **Softwarescan**, incluindo a estrutura do aplicativo e a API, funcionalidades implementadas, integração com serviços externos e como rodar o projeto em ambiente de desenvolvimento.

Para qualquer dúvida adicional, entre em contato com a equipe de desenvolvimento.

---
