# Instruções para Build do Softwarescan v2.9.0

Este documento contém instruções para fazer o build do app Softwarescan usando o EAS (Expo Application Services) para diversas plataformas.

## Pré-requisitos

1. Instalar Node.js (recomendado versão 18.18.2)
2. Instalar EAS CLI:
   ```
   npm install -g eas-cli
   ```
3. Login no Expo:
   ```
   eas login
   ```
4. Configurar as variáveis de ambiente:
   - `EXPO_PUBLIC_API_URL`: URL da API backend
   - `EXPO_PUBLIC_GOOGLE_API_KEY`: Chave da API do Google Maps
   - `EXPO_PUBLIC_ONESIGNAL_APP_ID`: ID do app no OneSignal
   - `GOOGLE_SERVICES_JSON`: Arquivo google-services.json codificado em base64

## Comandos para Build

### Build de Desenvolvimento (APK para testes)

Para gerar um APK de desenvolvimento que inclui o cliente de desenvolvimento do Expo:

```bash
cd app
eas build --platform android --profile development
```

### Build de Preview (APK para testes internos)

Para gerar um APK para testes internos, otimizado mas ainda não finalizado para produção:

```bash
cd app
eas build --platform android --profile preview
```

### Build de Produção (Android App Bundle para Google Play)

Para gerar um AAB (Android App Bundle) para publicação na Google Play Store:

```bash
cd app
eas build --platform android --profile production
```

### Build de Produção (APK para distribuição direta)

Para gerar um APK de produção para distribuição direta, sem passar pela Play Store:

```bash
cd app
eas build --platform android --profile productionApk
```

## Publicação na Google Play Store

Para enviar o build para a Google Play Store:

```bash
cd app
eas submit --platform android --profile production
```

## Atualização OTA (Over-the-air)

Para enviar atualizações de código sem fazer um novo build:

```bash
cd app
eas update --branch production --message "v2.9.0 - Melhorias de performance"
```

## Verificação de Builds

Para verificar o status dos builds:

```bash
eas build:list
```

## Notas da versão 2.9.0

Esta versão inclui importantes melhorias de performance:

1. Otimização do carregamento de imagens
2. Caching avançado para maps e localização
3. Memoização de componentes React para melhor desempenho
4. Otimização de renderização de listas
5. Debounce para operações de busca
6. Processamento em chunks para sincronização de posts offline
7. Redução de re-renders desnecessários

## Testando o APK gerado

Após o download do APK:

1. Transfira o arquivo para o dispositivo Android
2. Permita a instalação de fontes desconhecidas nas configurações
3. Abra o arquivo APK para instalar o aplicativo
4. Verifique se todas as funcionalidades estão operando normalmente

## Solução de Problemas

- **Erro de versão**: Certifique-se de que o `versionCode` no `app.config.js` foi incrementado
- **Erro de build**: Verifique os logs completos com `eas build:view`
- **Problemas de permissão**: Verifique se todas as permissões necessárias estão listadas no `app.config.js` 