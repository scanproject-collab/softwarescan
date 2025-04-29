# Guia para Correção de Erros do Google Maps

Este guia ajudará você a corrigir os erros comuns ao integrar o Google Maps na sua aplicação React, especificamente os erros que você está enfrentando no componente `PolygonManagement.tsx`.

## Erros Comuns e Suas Causas

Você está enfrentando os seguintes erros:

1. **"F is undefined"** - Este erro ocorre quando o Google Maps tenta acessar propriedades internas antes que elas estejam definidas. Isso geralmente acontece quando você tenta usar os objetos do Google Maps antes que a API seja completamente carregada.

2. **"google is not defined"** - Similar ao primeiro erro, isso ocorre quando você tenta acessar o objeto `window.google` antes que a biblioteca do Google Maps seja carregada no navegador.

3. **"Element with name X already defined"** - Este erro ocorre quando você tenta carregar a biblioteca do Google Maps múltiplas vezes, geralmente por causa de renderizações redundantes ou configurações duplicadas.

4. **Erros em componentWillUnmount** - Estes erros ocorrem quando o componente é desmontado antes que a limpeza das referências do Google Maps seja concluída, ou quando tentativas de acessar objetos do Google Maps são feitas após a desmontagem.

## Como Corrigir os Erros - Passo a Passo

### Passo 1: Use apenas o hook useJsApiLoader para carregar a API

O primeiro passo é garantir que você está usando apenas o `useJsApiLoader` para carregar a API do Google Maps, não o componente `LoadScript`.

```tsx
// Remova qualquer uso do componente LoadScript
// INCORRETO:
<LoadScript googleMapsApiKey={googleMapsApiKey} libraries={GOOGLE_MAPS_LIBRARIES}>
  {renderMap()}
</LoadScript>

// Em vez disso, coloque esta declaração no topo do componente:
const { isLoaded, loadError } = useJsApiLoader({
  id: 'google-map-script',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  libraries: GOOGLE_MAPS_LIBRARIES,
  language: 'pt-BR',
  region: 'BR'
});
```

### Passo 2: Defina Bibliotecas Fora do Componente

Para evitar recriações desnecessárias do array de bibliotecas e problemas de "Element already defined":

```tsx
// Fora do componente, no nível superior do arquivo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GOOGLE_MAPS_LIBRARIES: any[] = ["geometry", "visualization"];

// Dentro do componente, não redefina as bibliotecas
```

### Passo 3: Nunca Acesse window.google Antes de Verificar isLoaded

Sempre verifique se o Google Maps está carregado antes de tentar usar qualquer funcionalidade:

```tsx
// INCORRETO:
useEffect(() => {
  const point = new google.maps.LatLng(latitude, longitude);
  // ...
}, []);

// CORRETO:
useEffect(() => {
  if (isLoaded && window.google?.maps) {
    const point = new window.google.maps.LatLng(latitude, longitude);
    // ...
  }
}, [isLoaded]);
```

### Passo 4: Renderize o Mapa Condicionalmente

Sempre renderize o mapa e seus componentes apenas quando `isLoaded` for `true`:

```tsx
// Na função de renderização do componente
if (!isLoaded) {
  return <MapLoader />;
}

if (loadError) {
  return (
    <div className="error-container">
      <p>Erro ao carregar o Google Maps: {loadError.message}</p>
      <button onClick={() => window.location.reload()}>Recarregar</button>
    </div>
  );
}

// Só renderize o GoogleMap quando isLoaded for true
return (
  <MapErrorBoundary>
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={onMapLoad}
    >
      {/* Conteúdo do mapa */}
    </GoogleMap>
  </MapErrorBoundary>
);
```

### Passo 5: Adicione Error Boundaries

Adicione um componente ErrorBoundary para capturar erros do Google Maps:

```tsx
// Adicione esta classe no seu arquivo
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro no componente do Google Maps:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <p>Erro ao renderizar o mapa. {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// E use-a para envolver seu mapa
<MapErrorBoundary>
  <GoogleMap {...props} />
</MapErrorBoundary>
```

### Passo 6: Use null checks em todos os objetos do Google Maps

Sempre use verificações de nulidade quando acessar objetos do Google Maps:

```tsx
// INCORRETO:
<Marker
  position={point}
  icon={{
    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    scaledSize: new google.maps.Size(30, 30),
  }}
/>

// CORRETO:
{window.google && (
  <Marker
    position={point}
    icon={{
      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      scaledSize: new window.google.maps.Size(30, 30),
    }}
  />
)}
```

## Aplicando os Fixes no PolygonManagement.tsx

Aqui está um plano passo a passo para modificar seu componente PolygonManagement.tsx:

1. **Limpe Bibliotecas Duplicadas**: 
   - Mantenha apenas uma declaração de `GOOGLE_MAPS_LIBRARIES` no topo do arquivo
   - Remova qualquer outro array de bibliotecas duplicado

2. **Limpe Estados Duplicados**:
   - Mantenha apenas uma declaração para cada estado (`googleMapsApiKey`, `isMapLoaded`, etc.)
   - Remova funções auxiliares duplicadas como `clearDateFilters`

3. **Correção da Carga da API**:
   - Remova o componente `LoadScript`
   - Confie apenas no hook `useJsApiLoader`
   - Adicione verificações adequadas de `isLoaded` antes de renderizar o mapa

4. **Proteção contra "google is not defined"**:
   - Adicione verificações de `window.google` em todos os lugares que usam objetos do Google Maps
   - Use formatação de `window.google?.maps` para acesso seguro

5. **Estrutura de Renderização**:
   - Adicione renderização condicional com base em `isLoaded` e `loadError`
   - Adicione componentes para estados de carregamento e erro
   - Envolva todo o mapa com `MapErrorBoundary`

## Estrutura Recomendada para o Componente

Aqui está uma estrutura recomendada para seu componente PolygonManagement:

```tsx
// Bibliotecas e constantes no topo
const GOOGLE_MAPS_LIBRARIES = ["geometry", "visualization"];

// Componente Error Boundary
class MapErrorBoundary extends React.Component {
  // ... implementação conforme mostrada acima
}

// Componente de carregamento
const MapLoader = () => (
  // ... implementação do componente de carregamento
);

// Componente principal
const PolygonManagement: React.FC = () => {
  // 1. Estados e Refs
  const [estado1, setEstado1] = useState(...);
  // ... outros estados
  
  // 2. Configuração do Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
    id: 'google-map-script',
  });
  
  // 3. Efeitos e lógica de negócios
  useEffect(() => {
    // Lógica que não depende do Google Maps
  }, []);
  
  useEffect(() => {
    if (isLoaded && window.google?.maps) {
      // Lógica que depende do Google Maps
    }
  }, [isLoaded, /* outras dependências */]);
  
  // 4. Handlers e funções auxiliares
  const handleClick = () => {
    // ...
  };
  
  // 5. Renderização condicional para estados de erro/carregamento
  if (!googleMapsApiKey) {
    return <div>Erro: Chave da API não configurada</div>;
  }
  
  if (loadError) {
    return <div>Erro ao carregar o Google Maps: {loadError.message}</div>;
  }
  
  if (!isLoaded) {
    return <MapLoader />;
  }
  
  // 6. Renderização do mapa (apenas quando isLoaded === true)
  return (
    <div className="container">
      {/* Conteúdo não relacionado ao mapa */}
      
      <MapErrorBoundary>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onMapLoad}
        >
          {/* Conteúdo do mapa (marcadores, polígonos, etc.) */}
        </GoogleMap>
      </MapErrorBoundary>
    </div>
  );
};
```

## Melhores Práticas para o Google Maps em React

1. **Use sempre useJsApiLoader** em vez de LoadScript para melhor controle e prevenção de erros
2. **Declare bibliotecas fora do componente** para evitar recriações desnecessárias
3. **Verifique sempre isLoaded** antes de renderizar ou usar objetos do Google Maps
4. **Use window.google em vez de apenas google** para melhor tipagem e clareza
5. **Adicione verificações de nulidade** (`?.`) em todos os acessos a objetos do Google Maps
6. **Envolva o componente do mapa em um ErrorBoundary** para capturar erros de renderização
7. **Separe a lógica de carregamento do mapa** da lógica de negócios do seu componente
8. **Use useCallback para funções como onMapLoad** para prevenir renderizações desnecessárias
9. **Gerencie o ciclo de vida do mapa corretamente** limpando referências quando o componente desmontar

## Conclusão

Os problemas que você está enfrentando são comuns ao integrar o Google Maps com React. Seguindo este guia, você deve conseguir resolver os erros específicos no seu componente PolygonManagement.tsx sem precisar reescrevê-lo completamente.

Para referência, examine o arquivo de exemplo `FixGoogleMapsLoading.tsx` que fornecemos, que implementa todas estas correções de uma forma limpa e clara.

Boa sorte com a integração do Google Maps! Se persistirem problemas específicos, revise sua implementação com base nas etapas acima.

