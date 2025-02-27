Aqui está o **README do Frontend**:

### **2. README do Frontend (`scan-frontend/README.md`)**

```markdown
# Scan Frontend (React Native)

Este repositório contém o frontend da aplicação **Scan** desenvolvido em **React Native** com **Expo**.

## Tecnologias Utilizadas

- **React Native** com **Expo**.
- **Firebase** para autenticação de usuários e upload de fotos.
- **TailwindCSS** (via `tailwind-rn`) para estilização.
- **React Navigation** para navegação entre telas.

## Funcionalidades

- **Tela de Login/Criação de Conta**: Permite que o operador crie uma conta e faça login no sistema.
- **Upload de Fotos**: Permite que o operador envie fotos e registre informações como localização e hora.
- **Exibição de Fotos Recentes**: Exibe as fotos tiradas recentemente, com filtros para visualização.
- **Mapa Interativo**: Visualização de interações em um mapa com pontuação, com filtros de tipo de interação, área e período.

## Como Rodar o Projeto

### Requisitos:
- **Node.js** (versão >= 16.x)
- **Expo CLI**: Instale com `npm install -g expo-cli`.

### Passos para rodar:

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/scan-frontend.git
   cd scan-frontend
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   ```

3. Inicie o servidor Expo:
   ```bash
   expo start
   ```

4. Abra o aplicativo no seu dispositivo Android ou iOS através do aplicativo **Expo Go** ou em um emulador.

## Estrutura do Código

- **src/components/**: Componentes reutilizáveis (botões, inputs, etc.).
- **src/screens/**: Telas principais da aplicação (Login, Dashboard, etc.).
- **src/services/**: Integração com Firebase e outras APIs externas.

## Como Contribuir

1. Faça um fork deste repositório.
2. Crie uma branch para sua funcionalidade: `git checkout -b feature/nome-da-funcionalidade`.
3. Comite suas alterações: `git commit -am 'Adiciona nova funcionalidade'`.
4. Push para a branch: `git push origin feature/nome-da-funcionalidade`.
5. Abra um Pull Request.

```