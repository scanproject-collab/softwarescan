import React, { useState, useEffect, useRef, useCallback } from "react";
import { FlatList, Alert, StyleSheet, Text, Platform } from "react-native";
import TitleInput from "@/src/app/components/posts/TitleInput";
import DescriptionInput from "@/src/app/components/posts/DescriptionInput";
import TagSelector from "@/src/app/components/posts/TagSelector";
import DatePicker from "@/src/app/components/posts/DatePicker";
import TimeInput from "@/src/app/components/posts/TimeInput";
import LocationPicker from "@/src/app/components/posts/LocationPicker";
import MapViewComponent from "@/src/app/components/posts/MapViewComponent";
import ImagePickerComponent from "@/src/app/components/posts/ImagePickerComponent";
import SubmitButton from "@/src/app/components/posts/SubmitButton";
import { reverseGeocode } from "@/src/app/utils/GoogleMaps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateToken } from "@/src/app/utils/ValidateAuth";
import { useRouter, useFocusEffect } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";

interface Tag {
  name: string;
  weight: string | null;
}

export default function NewInteraction() {
  // Estados básicos
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Estados para data e hora
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  // Estados de interface
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const isMounted = useRef(true);

  const router = useRouter();
  // Certifica-se de que API_URL sempre tenha um valor
  const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.example.com";

  // Reset de formulário com segurança para todos os campos
  const resetForm = useCallback(() => {
    if (!isMounted.current) return;

    setTitle("");
    setDescription("");
    setSelectedTags([]);
    setImage(null);
    setLocation("");
    setCoords(null);

    try {
      const now = new Date();
      setSelectedDate(now.toISOString().split("T")[0]);

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    } catch (error) {
      console.error("Erro ao formatar data/hora:", error);
      // Valores padrão em caso de erro
      setSelectedDate("2023-01-01");
      setSelectedTime("12:00");
    }

    setIsManualLocation(false);
    setStatus("idle");
  }, []);

  // Verificação de conectividade com tratamento de erros aprimorado
  const checkActualConnectivity = useCallback(async () => {
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${API_URL}/ping`, {
          method: "GET",
          signal: controller.signal,
        });
        return response && response.ok;
      } catch (error) {
        console.log("Connectivity check error:", error);
        return false;
      }
    } catch (error) {
      console.log("Connectivity check outer error:", error);
      return false;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [API_URL]);

  // Verificação de conexão com feedback aprimorado
  const checkConnection = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const netInfo = await NetInfo.fetch();
      let isConnected = false;

      if (netInfo.isConnected) {
        isConnected = await checkActualConnectivity();
      }

      if (!isMounted.current) return;

      setIsOffline(!isConnected);

      if (!isConnected) {
        setIsManualLocation(true);
        Alert.alert("Você está offline", "A localização será inserida manualmente.");
      }
    } catch (error) {
      console.log("Erro ao verificar conexão:", error);
      if (isMounted.current) {
        setIsOffline(true);
        setIsManualLocation(true);
      }
    }
  }, [checkActualConnectivity]);

  // Efeito principal de inicialização
  useEffect(() => {
    isMounted.current = true;

    const initialize = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid || !isMounted.current) return;

        await checkConnection();
        if (!isMounted.current) return;

        // Show toast for location loading
        if (isMounted.current && isLocationLoading) {
          Toast.show({
            type: 'info',
            text1: 'Carregando localização...',
            position: 'bottom',
            visibilityTime: 2000,
          });
        }

        // Carregamento de tags com tratamento de erros
        try {
          const cachedTags = await AsyncStorage.getItem("cachedTags");
          if (cachedTags && isMounted.current) {
            setAvailableTags(JSON.parse(cachedTags));
          }

          if (!isOffline && isMounted.current) {
            try {
              const token = await AsyncStorage.getItem("userToken");
              const response = await fetch(`${API_URL}/tags`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              if (response.ok && isMounted.current) {
                setAvailableTags(data.tags || []);
                await AsyncStorage.setItem("cachedTags", JSON.stringify(data.tags));
              }
            } catch (error) {
              console.log("Erro ao carregar tags online, usando cache:", error);
            }
          }
        } catch (error) {
          console.error("Erro ao inicializar tags:", error);
        }

        // Inicialização de localização com tratamento de erros aprimorado
        if (isMounted.current) {
          try {
            console.log("Verificando dados de localização em cache...");

            const cachedLocationJson = await AsyncStorage.getItem("userLocation");
            const cachedAddress = await AsyncStorage.getItem("userLocationAddress");
            const cachedTimestamp = await AsyncStorage.getItem("userLocationTimestamp");

            let isRecentCache = false;

            try {
              const currentTime = Date.now();
              isRecentCache = cachedTimestamp !== null &&
                (currentTime - parseInt(cachedTimestamp || '0')) < 5 * 60 * 1000;
            } catch (error) {
              console.error("Erro ao verificar timestamp do cache:", error);
            }

            if (cachedLocationJson && cachedAddress && isRecentCache && isMounted.current) {
              try {
                const cachedLocation = JSON.parse(cachedLocationJson);
                console.log("Usando localização em cache recente:", cachedLocation);

                setCoords(cachedLocation);
                setLocation(cachedAddress);
                setIsLocationLoading(false);

                if (!isOffline) {
                  updateLocationInBackground();
                }
                return;
              } catch (error) {
                console.error("Erro ao processar localização em cache:", error);
              }
            }

            console.log("Não há dados de localização em cache recentes. Buscando novos...");

            if (isOffline) {
              if (cachedLocationJson && cachedAddress) {
                try {
                  const cachedLocation = JSON.parse(cachedLocationJson);
                  setCoords(cachedLocation);
                  setLocation(cachedAddress);
                  console.log("Usando dados de localização em cache (possivelmente desatualizados) no modo offline");
                  setIsLocationLoading(false);
                  return;
                } catch (error) {
                  console.error("Erro ao processar localização offline:", error);
                }
              }
            }

            await getNewLocation();
          } catch (error) {
            console.error("Erro na inicialização da localização:", error);
            if (isMounted.current) {
              setIsLocationLoading(false);
            }
          }
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
        if (isMounted.current) {
          setIsLocationLoading(false);
        }
      }
    };

    initialize();

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (!isMounted.current) return;
      const isConnected = state.isConnected && (await checkActualConnectivity());
      if (isMounted.current) {
        setIsOffline(!isConnected);
        if (!isConnected) setIsManualLocation(true);
      }
    });

    return () => {
      console.log("NewInteraction desmontado");
      isMounted.current = false;
      unsubscribe();
    };
  }, [isOffline, checkConnection, checkActualConnectivity, API_URL]);

  // Adicionar este useEffect após useEffect principal para monitorar mudanças nas coordenadas
  useEffect(() => {
    if (coords) {
      console.log("Coordenadas atualizadas em NewInteraction:", coords);
      setIsLocationLoading(false);
    }
  }, [coords]);

  // Atualizar o endereço quando as coordenadas mudam (clique no mapa)
  useEffect(() => {
    if (coords && isManualLocation === false && !isOffline) {
      const updateAddressFromCoords = async () => {
        try {
          console.log("Atualizando endereço a partir das coordenadas:", coords);
          const address = await reverseGeocode(coords.latitude, coords.longitude);
          if (address && typeof address === 'string' && !address.includes("Erro")) {
            setLocation(address);
            console.log("Novo endereço atualizado a partir das coordenadas:", address);
          }
        } catch (error) {
          console.error("Erro ao atualizar endereço a partir das coordenadas:", error);
        }
      };
      updateAddressFromCoords();
    }
  }, [coords, isManualLocation, isOffline]);

  // Obtenção de nova localização com tratamento de erros aprimorado
  const getNewLocation = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        if (isMounted.current) {
          setLocation("Permissão de localização não concedida");
          setIsLocationLoading(false);
        }
        return;
      }

      let locationData = null;

      try {
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout getting location")), 5000)
        );

        locationData = await Promise.race([locationPromise, timeoutPromise]);
      } catch (error) {
        console.log("Timeout or error getting precise location, falling back to last known:", error);
        try {
          locationData = await Location.getLastKnownPositionAsync();
        } catch (fallbackError) {
          console.error("Erro ao obter localização de fallback:", fallbackError);
        }
      }

      if (!isMounted.current) return;

      if (locationData && locationData.coords) {
        const { latitude, longitude } = locationData.coords;
        console.log("Novas coordenadas obtidas:", latitude, longitude);

        // Garantir que são valores numéricos válidos
        if (typeof latitude === 'number' && !isNaN(latitude) &&
          typeof longitude === 'number' && !isNaN(longitude)) {
          if (isMounted.current) {
            console.log("Atualizando estado de coordenadas com:", { latitude, longitude });
            setCoords({ latitude, longitude });
          }

          try {
            await AsyncStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));
            await AsyncStorage.setItem("userLocationTimestamp", Date.now().toString());
          } catch (storageError) {
            console.error("Erro ao salvar localização no storage:", storageError);
          }

          try {
            console.log("Executando reverse geocoding para novas coordenadas...");
            const address = await reverseGeocode(latitude, longitude);

            if (!isMounted.current) return;

            if (address && typeof address === 'string') {
              if (address.includes("Erro")) {
                console.error("Erro no geocoding:", address);
                setLocation("Endereço não encontrado");
              } else {
                console.log("Novo endereço obtido:", address);
                setLocation(address);

                try {
                  await AsyncStorage.setItem("userLocationAddress", address);
                } catch (storageError) {
                  console.error("Erro ao salvar endereço no storage:", storageError);
                }
              }
            } else {
              console.error("Resposta inválida do geocoding");
              setLocation("Erro ao obter endereço");
            }
          } catch (error) {
            console.error("Erro no reverse geocoding:", error);
            if (isMounted.current) {
              setLocation("Erro ao obter endereço");
            }
          }
        }
      } else {
        if (isMounted.current) {
          setLocation("Não foi possível obter localização");
        }
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      if (isMounted.current) {
        setLocation("Erro ao obter localização");
      }
    } finally {
      if (isMounted.current) {
        setIsLocationLoading(false);
      }
    }
  }, []);

  // Atualização de localização em background com tratamento aprimorado
  const updateLocationInBackground = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!isMounted.current) return;

      if (locationData && locationData.coords) {
        const { latitude, longitude } = locationData.coords;

        try {
          await AsyncStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));
          await AsyncStorage.setItem("userLocationTimestamp", Date.now().toString());
        } catch (storageError) {
          console.error("Erro ao salvar localização no storage:", storageError);
        }

        if (isMounted.current) {
          setCoords({ latitude, longitude });
        }

        try {
          const address = await reverseGeocode(latitude, longitude);
          if (address && typeof address === 'string' && !address.includes("Erro") && isMounted.current) {
            await AsyncStorage.setItem("userLocationAddress", address);
            setLocation(address);
          }
        } catch (geocodeError) {
          console.error("Erro ao geocodificar endereço:", geocodeError);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar localização em segundo plano:", error);
    }
  }, []);

  // Manipulador de envio com tratamento aprimorado
  const handleSubmit = useCallback(async () => {
    if (loading || !isMounted.current || isImageLoading) return;

    setLoading(true);
    setStatus("saving");

    try {
      const isValid = await validateToken();
      if (!isValid || !isMounted.current) {
        setLoading(false);
        setStatus("error");
        return;
      }

      if (!image) {
        Alert.alert("Erro", "Uma foto é obrigatória.");
        setLoading(false);
        setStatus("error");
        return;
      }

      if (!location.trim()) {
        Alert.alert("Erro", "A localização é obrigatória.");
        setLoading(false);
        setStatus("error");
        return;
      }

      // Cálculo de peso total com validação
      let totalWeight = 0;
      try {
        totalWeight = selectedTags.reduce((sum, tagName) => {
          const tag = availableTags.find((t) => t.name === tagName);
          return sum + (tag && tag.weight ? parseFloat(tag.weight) : 0);
        }, 0);
      } catch (error) {
        console.error("Erro ao calcular peso total:", error);
      }

      const ranking = totalWeight <= 250 ? "Baixo" : totalWeight <= 350 ? "Mediano" : "Urgente";

      if (isOffline) {
        try {
          const offlinePost = {
            id: Date.now().toString(),
            title,
            content: description,
            tags: selectedTags,
            location,
            image,
            latitude: coords?.latitude || null,
            longitude: coords?.longitude || null,
            weight: totalWeight.toString(),
            ranking,
            createdAt: new Date().toISOString(),
            offlineId: `${Date.now().toString()}_${Math.random().toString(36).substring(2, 15)}`,
          };

          const offlinePostsJson = await AsyncStorage.getItem("offlinePosts");
          const offlinePosts = offlinePostsJson ? JSON.parse(offlinePostsJson) : [];
          offlinePosts.push(offlinePost);
          await AsyncStorage.setItem("offlinePosts", JSON.stringify(offlinePosts));

          Alert.alert(
            "Sucesso",
            "Postagem salva offline. Será enviada ao servidor quando a conexão for restabelecida.",
            [
              {
                text: "OK",
                onPress: () => {
                  resetForm();
                  router.push("/");
                }
              }
            ]
          );
          setLoading(false);
          setStatus("saved");
        } catch (error) {
          console.error("Erro ao salvar postagem offline:", error);
          Alert.alert("Erro", "Ocorreu um erro ao salvar a postagem offline.");
          setLoading(false);
          setStatus("error");
        }
        return;
      }

      try {
        const token = await AsyncStorage.getItem("userToken");
        const postData = {
          title,
          content: description,
          tags: selectedTags.join(","),
          location,
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null,
          weight: totalWeight.toString(),
          ranking,
          createdAt: new Date().toISOString(),
          offlineId: `online_${Date.now().toString()}_${Math.random().toString(36).substring(2, 15)}`,
        };

        const formData = new FormData();

        // Adicionando dados ao FormData com validação
        Object.entries(postData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        if (image) {
          const fileName = image.split("/").pop() || "image.jpg";
          const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

          // Criar o objeto de arquivo de forma segura para todas as plataformas
          const fileObject = Platform.OS === 'ios'
            ? { uri: image, name: fileName, type: fileType }
            : { uri: image, name: fileName, type: fileType } as any;

          formData.append("image", fileObject);
        }

        console.log("Sending post data to API:", JSON.stringify(postData, null, 2));

        const response = await fetch(`${API_URL}/posts/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await response.json();

        if (response.ok) {
          Alert.alert(
            "Sucesso",
            "Postagem criada com sucesso!",
            [
              {
                text: "OK",
                onPress: () => {
                  resetForm();
                  router.push("/");
                }
              }
            ]
          );
        } else {
          Alert.alert("Erro", responseData.message || "Erro ao criar postagem.");
        }
      } catch (error) {
        console.error("Erro ao enviar postagem:", error);
        Alert.alert("Erro", "Ocorreu um problema ao salvar a postagem.");
      }
    } catch (error) {
      console.error("Erro no processo de submissão:", error);
      Alert.alert("Erro", "Ocorreu um problema ao processar a postagem.");
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setStatus("idle");
      }
    }
  }, [loading, isMounted, isImageLoading, image, location, selectedTags, availableTags,
    coords, title, description, isOffline, router, resetForm, API_URL]);

  // Renderização de componentes com tratamento de erros
  const renderItem = useCallback(({ item }: { item: string }) => {
    try {
      if (item === "title") return <TitleInput title={title} setTitle={setTitle} isOffline={isOffline} />;
      if (item === "date") return <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
      if (item === "time") return <TimeInput selectedTime={selectedTime} setSelectedTime={setSelectedTime} />;
      if (item === "description") return <DescriptionInput description={description} setDescription={setDescription} />;
      if (item === "tags") return <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} availableTags={availableTags} />;
      if (item === "location") return (
        <LocationPicker
          location={location}
          setLocation={setLocation}
          isManualLocation={isManualLocation}
          setIsManualLocation={setIsManualLocation}
          isOffline={isOffline}
          setCoords={setCoords}
        />
      );

      // Renderizar o mapa mesmo durante o carregamento, apenas verificando se coords existe
      if (item === "map") {
        console.log("Tentando renderizar mapa com coordenadas:", coords);
        return (
          <MapViewComponent
            coords={coords}
            handleMapPress={(event) => {
              if (event?.nativeEvent?.coordinate) {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                setCoords({ latitude, longitude });
              }
            }}
            isManualLocation={isManualLocation}
            isOffline={isOffline}
          />
        );
      }

      if (item === "image") {
        return (
          <ImagePickerComponent
            image={image}
            setImage={(uri) => {
              try {
                setIsImageLoading(true);
                if (uri !== null && typeof uri === 'string') {
                  setImage(uri);
                } else {
                  console.log("Invalid image URI received:", uri);
                }
              } catch (error) {
                console.error("Error setting image:", error);
              } finally {
                setIsImageLoading(false);
              }
            }}
          />
        );
      }
      if (item === "buttons") {
        return (
          <SubmitButton
            loading={loading || isImageLoading}
            handleSubmit={handleSubmit}
            router={router}
            isOffline={isOffline}
            status={status}
          />
        );
      }
      return null;
    } catch (error) {
      console.error(`Erro ao renderizar item ${item}:`, error);
      return <Text style={styles.errorText}>Erro ao carregar componente</Text>;
    }
  }, [title, selectedDate, selectedTime, description, selectedTags, location,
    coords, image, loading, isImageLoading, isOffline, isManualLocation,
    isLocationLoading, availableTags, router, status, handleSubmit]);

  // Limpar formulário quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      console.log("NewInteraction recebeu foco, resetando formulário...");
      // Atrasar o resetForm para permitir que a localização seja carregada primeiro
      const loadLocationOnly = async () => {
        setTitle("");
        setDescription("");
        setSelectedTags([]);
        setImage(null);
        setStatus("idle");
        
        // Não resetar a localização, apenas obter a localização atual
        try {
          const isValid = await validateToken();
          if (isValid) {
            await checkConnection();
            await getNewLocation();
          }
        } catch (error) {
          console.error("Erro ao recarregar localização:", error);
        }
      };
      
      loadLocationOnly();
      
      return () => {
        // Código executado quando a tela perde o foco
        console.log("NewInteraction perdeu foco");
      };
    }, [])
  );

  return (
    <>
      <FlatList
        data={["title", "date", "time", "description", "tags", "location",
          // Passar o item "map" apenas se tivermos coordenadas válidas ou estivermos carregando
          ...((coords !== null && coords !== undefined) || isLocationLoading ? ["map"] : []),
          "image", "buttons"]}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.container}
      />
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16, paddingBottom: 80 },
  loadingText: { textAlign: "center", color: "#666", marginVertical: 16 },
  errorText: { textAlign: "center", color: "red", marginVertical: 8 },
});