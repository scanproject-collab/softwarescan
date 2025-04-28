# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.9.0] - 2024-10-10

### Melhorias

- Adicionado toast de notificação durante o carregamento da localização
- Corrigido botão de refresh na página inicial
- Ajustado o tamanho do ícone do app para melhor visualização
- Melhorada a interface de carregamento do mapa
- Otimizada a exibição de localização na tela de nova interação
- Adicionado tratamento de erros robusto na captura de localização

### Melhorias de Performance

- **Sistema de Caching**
  - Implementado cache com timestamps para dados de localização
  - Adicionado cache para respostas da API do Google Maps
  - Cache inteligente para cálculos frequentes como `isPostRecent`
  - Sistema de expiração para limpar cache antigo automaticamente

- **Otimização de Componentes React**
  - Aplicado `React.memo()` em todos os componentes principais
  - Implementado `useCallback` para preservar referências de funções
  - Removidos re-renders desnecessários
  - Componentização mais eficiente com subcomponentes otimizados

- **Carregamento de Imagens**
  - Novo componente `OptimizedImage` com estados de loading e erro
  - Compressão mais eficiente de imagens (60% vs 70% anteriormente)
  - Indicadores visuais durante carregamento
  - Fallbacks para falhas de carregamento de imagem

- **Otimizações de FlatList**
  - Implementado `removeClippedSubviews` para liberar memória
  - Ajustes em `maxToRenderPerBatch` e `windowSize` para renderização mais eficiente
  - Uso de `getItemLayout` para evitar cálculos de layout repetidos
  - Cache para elementos de lista para evitar re-renders

- **Melhorias na Localização**
  - Busca de localização em segundo plano
  - Timeout para evitar bloqueios na obtenção de localização
  - Fallback para `getLastKnownPosition` quando a localização atual é lenta
  - Arredondamento de coordenadas para melhor uso de cache

- **Otimizações de Rede**
  - Implementação de AbortController para requests
  - Redução de timeout de 15s para 8s para melhor resposta
  - Verificação de conectividade antes de requisições
  - Processamento em lotes para sincronização de dados offline

- **Estado e Fluxo de Dados**
  - Debounce para operações de busca (300ms)
  - Atualização em segundo plano para dados não críticos
  - Melhor gerenciamento de dependências em useEffect
  - Pull-to-refresh implementado para atualização de dados

### Correções de Bugs

- Corrigido problema de redirecionamento durante verificação de email
- Corrigida exibição de alertas redundantes em caso de erro de conexão
- Resolvido problema de timeout em operações map/geocoding
- Corrigida sincronização de posts offline em conexões instáveis

### Novas Funcionalidades

- Pull-to-refresh na lista de posts
- Indicadores visuais aprimorados para status offline
- Melhor tratamento de erros com fallbacks apropriados

## [2.8.0] - 2024-09-28

### Adicionado

- Suporte a tags em posts
- Filtro por tags
- Melhorias na interface do usuário 