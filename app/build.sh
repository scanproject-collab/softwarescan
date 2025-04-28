#!/bin/bash

# Script para facilitar o build e distribuição do Softwarescan

# Cores para mensagens
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções
print_header() {
  echo -e "\n${BLUE}=========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}=========================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}! $1${NC}"
}

check_env() {
  if [ -z "$EXPO_PUBLIC_API_URL" ]; then
    print_error "Variável EXPO_PUBLIC_API_URL não configurada"
    missing_env=true
  fi
  
  if [ -z "$EXPO_PUBLIC_GOOGLE_API_KEY" ]; then
    print_error "Variável EXPO_PUBLIC_GOOGLE_API_KEY não configurada"
    missing_env=true
  fi
  
  if [ -z "$EXPO_PUBLIC_ONESIGNAL_APP_ID" ]; then
    print_error "Variável EXPO_PUBLIC_ONESIGNAL_APP_ID não configurada"
    missing_env=true
  fi
  
  if [ -z "$GOOGLE_SERVICES_JSON" ]; then
    print_error "Variável GOOGLE_SERVICES_JSON não configurada"
    missing_env=true
  fi
  
  if [ "$missing_env" = true ]; then
    exit 1
  fi
  
  print_success "Todas as variáveis de ambiente estão configuradas"
}

# Validar ambiente
print_header "Verificando ambiente"
check_env

# Mostrar menu de opções
print_header "Softwarescan Build Script v2.9.0"

echo "Escolha uma opção de build:"
echo "1) Build de Desenvolvimento (APK com cliente de desenvolvimento)"
echo "2) Build de Preview (APK interno para testes)"
echo "3) Build de Produção (AAB para Google Play)"
echo "4) Build de Produção APK (para distribuição direta)"
echo "5) Atualização OTA (sem novo build)"
echo "6) Verificar builds existentes"
echo "7) Sair"

read -p "Opção (1-7): " option

case $option in
  1)
    print_header "Iniciando build de desenvolvimento"
    eas build --platform android --profile development
    ;;
  2)
    print_header "Iniciando build de preview"
    eas build --platform android --profile preview
    ;;
  3)
    print_header "Iniciando build de produção (AAB)"
    eas build --platform android --profile production
    ;;
  4)
    print_header "Iniciando build de produção (APK)"
    eas build --platform android --profile productionApk
    ;;
  5)
    print_header "Iniciando atualização OTA"
    read -p "Mensagem para esta atualização: " update_message
    eas update --branch production --message "$update_message"
    ;;
  6)
    print_header "Verificando builds existentes"
    eas build:list
    ;;
  7)
    print_header "Saindo"
    exit 0
    ;;
  *)
    print_error "Opção inválida"
    exit 1
    ;;
esac

print_success "Processo concluído!" 