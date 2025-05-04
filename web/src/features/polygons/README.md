# Polygon Management Feature

Este módulo permite o gerenciamento de polígonos em mapas para análise de dados geoespaciais. Ele é utilizado para definir áreas de interesse e visualizar a concentração de posts dentro destas áreas.

## Funcionalidades Principais

- **Desenho de Polígonos**: Permite desenhar polígonos personalizados no mapa para definir áreas de interesse.
- **Mapa de Calor (Heatmap)**: Visualiza a concentração de dados em diferentes áreas do mapa.
- **Filtros Avançados**: Filtra posts por data, tags e localização.
- **Exportação de Mapa**: Permite exportar o mapa com as visualizações em PNG, JPG ou PDF.
- **Análise de Posts por Polígono**: Calcula métricas para cada polígono com base nos posts contidos nele.

## Como Usar

### Desenhar um Polígono

1. Clique no botão "Desenhar Polígono" no painel lateral
2. Clique no mapa para adicionar pontos ao polígono
3. Para fechar o polígono, clique próximo ao ponto inicial
4. Digite um nome e observações (opcional) para o polígono
5. Salve o polígono

### Ativar Mapa de Calor

1. Clique no botão "Ativar Heatmap" no painel lateral
2. O mapa mostrará áreas de maior concentração de posts com cores mais quentes
3. Clique novamente para desativar o mapa de calor

### Filtrar Posts

Use os controles de filtro no painel lateral para:
- Filtrar por intervalo de datas
- Filtrar por tags específicas
- Filtrar por localização

### Exportar Mapa

1. Clique no botão "Exportar Mapa" no rodapé da página
2. Escolha o formato desejado: PNG, JPG ou PDF
3. O arquivo será baixado automaticamente

## Estrutura do Código

- **components/**: Componentes React para o mapa e controles
- **hooks/**: Hooks personalizados para gerenciamento de estado
- **types/**: Interfaces TypeScript para tipagem
- **utils/**: Funções utilitárias para manipulação de dados geoespaciais

## Requisitos Técnicos

- Google Maps API com as bibliotecas: 'geometry', 'visualization' e 'drawing'
- html2canvas-pro para exportação de imagens
- jsPDF para exportação em PDF

## Problemas Comuns e Soluções

### O mapa de calor não aparece
- Verifique se há dados de localização suficientes nos posts
- Confirme que a API do Google Maps está carregada corretamente com a biblioteca 'visualization'

### Não consigo desenhar polígonos
- Certifique-se de que o modo de desenho está ativado (botão destacado em laranja)
- Clique em pontos distintos do mapa para criar o polígono
- Feche o polígono clicando próximo ao ponto inicial

### A exportação do mapa não funciona
- Verifique se o mapa está totalmente carregado antes de exportar
- Alguns navegadores podem bloquear o download, verifique as permissões 