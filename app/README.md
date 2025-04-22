# Softwarescan

![Version](https://img.shields.io/badge/version-2.9.5-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![Node](https://img.shields.io/badge/node-18.x-green.svg)
![React Native](https://img.shields.io/badge/React%20Native-expo-61DBFB.svg)

## Visão Geral

O **Softwarescan** é uma plataforma móvel avançada que permite aos usuários registrar interações georreferenciadas, visualizar posts com informações detalhadas e interagir com outros participantes. Desenvolvido com React Native e Expo, oferece uma experiência fluida e otimizada para dispositivos iOS e Android.

## ✨ Novidades na versão 2.9.5

### 🚀 Melhorias de Performance

A versão 2.9.5 traz melhorias significativas na performance e estabilidade:

- **Carregamento Otimizado**
  - Carregamento inicial mais rápido das postagens
  - Refresh aprimorado com transições suaves
  - Sistema de cache inteligente para dados offline

- **Interface Aprimorada**
  - Cards de interação com visual moderno e intuitivo
  - Badge "Recente" para postagens novas (últimos 2 dias)
  - Botão "Ver Detalhes" para melhor navegação
  - Processo de verificação de e-mail mais seguro

- **Funcionalidades Estáveis**
  - Captura de localização mais precisa e rápida
  - Suporte offline aprimorado para localização
  - Sistema de filtragem de tags mais confiável
  - Correção de bugs na exibição de descrições

### 🐛 Correções Importantes

- Resolvido crash ao filtrar por tags
- Melhorado comportamento do refresh
- Corrigidos problemas de exibição de descrições
- Aprimorada navegação entre postagens
- Otimizado processo de verificação de e-mail

## ✨ Novidades na versão 2.9.0

### 🚀 Melhorias de Performance

A versão 2.9.0 apresenta significativas otimizações de performance:

- **Sistema de Caching Avançado**
  - Cache inteligente com timestamps para dados de localização
  - Cache otimizado para API do Google Maps
  - Expiração automática de dados obsoletos

- **Otimização de Renderização**
  - Componentes memoizados com React.memo()
  - Redução de re-renders desnecessários
  - useCallback e useMemo para manter referências estáveis

- **Melhorias de Imagem**
  - Carregamento otimizado com estados de loading
  - Compressão eficiente (60%) para redução de uso de dados
  - Fallbacks para falhas de carregamento

- **Performance de Lista**
  - Virtualização e windowing para listas longas
  - Batch rendering para melhor responsividade da UI
  - Pull-to-refresh otimizado

- **Operações de Mapa e Localização**
  - Busca de localização em segundo plano
  - Timeouts inteligentes para evitar bloqueios
  - Arredondamento de coordenadas para eficiência de cache

- **Otimização de Rede**
  - Controle de requisições com AbortController
  - Timeouts reduzidos para melhor experiência offline
  - Sincronização em lotes para dados offline

## 📱 Funcionalidades Principais

### 1. Autenticação Segura
- Registro com verificação de email por código
- Login com token JWT persistente
- Recuperação de senha por email
- Fluxo otimizado para verificação sem redirecionamentos indesejados

### 2. Interações Geolocalizadas
- Criação de posts com título, descrição e tags
- Captura otimizada de localização atual ou seleção no mapa
- Upload de imagens com compressão inteligente
- Funcionamento offline com sincronização automática

### 3. Exploração de Conteúdo
- Mapa interativo otimizado para performance
- Lista de posts com virtualização e carregamento eficiente
- Filtragem por tags com busca avançada
- Indicadores de estado offline com fallbacks apropriados

## 🏗️ Arquitetura do Projeto

```plaintext
app/
├── assets/                   # Recursos estáticos (imagens, fontes)
├── src/                      # Código fonte principal
│   ├── app/                  # Estrutura principal do aplicativo
│   │   ├── (tabs)/           # Componentes de abas principais
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── auth/         # Componentes de autenticação
│   │   │   ├── home/         # Componentes da tela inicial
│   │   │   ├── posts/        # Componentes de postagens
│   │   ├── pages/            # Páginas/rotas da aplicação
│   │   ├── utils/            # Utilitários e funções auxiliares
├── build.sh                  # Script de build automatizado
├── eas.json                  # Configuração do EAS Build
├── app.config.js             # Configuração do aplicativo
├── CHANGELOG.md              # Registro de alterações
└── BUILD-INSTRUCTIONS.md     # Instruções detalhadas de build
```

## 🔧 Tecnologias Utilizadas

- **Frontend**:
  - React Native com Expo
  - Expo Router para navegação
  - React Hooks otimizados (useCallback, useMemo)
  - AsyncStorage para persistência local

- **Mapa e Localização**:
  - React Native Maps
  - Google Maps API com caching
  - Expo Location otimizado

- **Integração e Serviços**:
  - OneSignal para notificações push
  - Axios para requisições HTTP
  - EAS Build para compilação e distribuição

- **Performance e Otimização**:
  - Memoização de componentes
  - Virtualização de lista
  - Caching avançado
  - Debounce para operações custosas

## 🚀 Processo de Build e Distribuição

### Pré-requisitos

- Node.js 18.x
- EAS CLI (`npm install -g eas-cli`)
- Conta Expo
- Variáveis de ambiente configuradas

### Utilizando o script build.sh

O projeto inclui um script automatizado para facilitar o processo de build:

```bash
# Na raiz do projeto
cd app
chmod +x build.sh  # Torna o script executável (apenas primeira vez)
./build.sh
```

O script verifica automaticamente o ambiente e oferece as seguintes opções:

1. **Build de Desenvolvimento**: Gera APK com cliente de desenvolvimento
2. **Build de Preview**: Cria APK para testes internos
3. **Build de Produção (AAB)**: Gera bundle para Google Play Store
4. **Build de Produção (APK)**: Cria APK para distribuição direta
5. **Atualização OTA**: Envia atualizações sem novo build
6. **Verificar builds existentes**: Lista builds realizados

### Configuração de Variáveis de Ambiente

Para o build funcionar corretamente, é necessário configurar as seguintes variáveis:

```bash
export EXPO_PUBLIC_API_URL="https://api.seudominio.com"
export EXPO_PUBLIC_GOOGLE_API_KEY="sua-chave-google-maps"
export EXPO_PUBLIC_ONESIGNAL_APP_ID="seu-onesignal-app-id"
export GOOGLE_SERVICES_JSON="seu-google-services-json-em-base64"
```

Alternativamente, crie um arquivo `.env` na pasta `app/` com estas variáveis.

## 📋 Requisitos de Sistema

### Para Desenvolvimento
- **Node.js**: 18.x ou superior
- **pnpm**: Gerenciador de pacotes recomendado
- **Expo CLI**: Versão mais recente
- **Android Studio**: Para emulador Android
- **Xcode**: Para emulador iOS (apenas macOS)

### Para Usuários Finais
- **Android**: 8.0 ou superior
- **iOS**: 13.0 ou superior
- **Armazenamento**: 100MB mínimo
- **Permissões**: Câmera, Localização, Armazenamento

## 🔄 Sincronização Offline

O Softwarescan implementa um sistema avançado de sincronização offline que:

1. Salva posts localmente quando sem conexão
2. Sincroniza automaticamente quando a conexão é restabelecida
3. Processa em lotes para otimizar uso de bateria e rede
4. Oferece indicadores visuais de status de sincronização

## 📚 Documentação Adicional

- **[CHANGELOG.md](CHANGELOG.md)**: Histórico completo de alterações
- **[BUILD-INSTRUCTIONS.md](BUILD-INSTRUCTIONS.md)**: Instruções detalhadas para build
- **[API-DOCS.md](API-DOCS.md)**: Documentação da API (se aplicável)

## ⚙️ Instruções de Desenvolvimento

1. Clone o repositório
   ```bash
   git clone https://github.com/scanproject-collab/softwarescan
   cd softwarescan
   ```

2. Instale as dependências
   ```bash
   pnpm install
   ```

3. Configure as variáveis de ambiente
   ```bash
   cp app/.env.example app/.env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o ambiente de desenvolvimento
   ```bash
   cd app
   pnpm start
   ```

## 📱 Instalação do Aplicativo

### Via Google Play Store
(Em breve)

### Via APK Direto
1. Baixe o APK mais recente da [página de releases](https://github.com/scanproject-collab/softwarescan/releases)
2. No dispositivo Android, habilite "Instalar de fontes desconhecidas"
3. Abra o arquivo APK para instalar

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

