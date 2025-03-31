import React, { useState, useEffect, useRef } from "react";
import { View, FlatList, Alert, StyleSheet } from "react-native";
import TitleInput from "@/src/app/components/posts/TitleInput";
import DescriptionInput from "@/src/app/components/posts/DescriptionInput";
import TagSelector from "@/src/app/components/posts/TagSelector";
import DatePicker from "@/src/app/components/posts/DatePicker";
import TimeInput from "@/src/app/components/posts/TimeInput";
import LocationPicker from "@/src/app/components/posts/LocationPicker";
import MapViewComponent from "@/src/app/components/posts/MapViewComponent";
import ImagePickerComponent from "@/src/app/components/posts/ImagePickerComponent";
import SubmitButton from "@/src/app/components/posts/SubmitButton";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPlayerId } from "@/src/app/utils/OneSignalNotification";
import { validateToken } from "@/src/app/utils/ValidateAuth";
import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import { reverseGeocode, geocodeAddress } from "@/src/app/utils/GoogleMaps";

interface Tag {
  name: string;
  weight: string | null;
}

export default function NewInteraction() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState(
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const isMounted = useRef(true);

  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const checkActualConnectivity = async () => {
    try {
      const response = await fetch(`${API_URL}/ping`, { 
        method: "GET", 
        timeout: 5000 
      }).catch(() => null);
      return response && response.ok;
    } catch {
      return false;
    }
  };

  const checkConnection = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      const isConnected = netInfo.isConnected && (await checkActualConnectivity());
      if (isMounted.current) {
        setIsOffline(!isConnected);
        if (!isConnected) {
          setIsManualLocation(true);
          Alert.alert("Você está offline", "A localização será inserida manualmente.");
        }
      }
    } catch (error) {
      console.log("Erro ao verificar conexão:", error);
      if (isMounted.current) {
        setIsOffline(true);
        setIsManualLocation(true);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    
    const initialize = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid || !isMounted.current) return;
      
        await checkConnection();
        if (!isMounted.current) return;
      
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
      
        if (!isOffline && isMounted.current) {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted" && isMounted.current) {
              try {
                const locationData = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.High,
                });
                
                if (!isMounted.current) return;
                
                const { latitude, longitude } = locationData.coords;
                setCoords({ latitude, longitude });
                
                try {
                  const address = await reverseGeocode(latitude, longitude);
                  if (isMounted.current) {
                    setLocation(address);
                  }
                } catch (error) {
                  console.error("Erro ao obter endereço via reverse geocoding:", error);
                  if (isMounted.current) {
                    setLocation("Localização não disponível");
                  }
                }
              } catch (error) {
                console.error("Erro ao obter localização:", error);
                if (isMounted.current) {
                  setLocation("Localização não disponível");
                }
              }
            } else {
              console.log("Permissão de localização não concedida");
              if (isMounted.current) {
                setLocation("Permissão de localização não concedida");
              }
            }
          } catch (error) {
            console.error("Erro ao obter permissão de localização:", error);
            if (isMounted.current) {
              setLocation("Erro ao obter permissão de localização");
            }
          }
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
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
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const syncPendingGeocode = async () => {
      if (!isOffline && isMounted.current) {
        try {
          const pendingGeocode = await AsyncStorage.getItem("pendingGeocode");
          if (pendingGeocode && isMounted.current) {
            try {
              const response = await geocodeAddress(pendingGeocode);
              if (isMounted.current) {
                setCoords(response);
                setLocation(pendingGeocode);
                await AsyncStorage.removeItem("pendingGeocode");
              }
            } catch (error) {
              console.error("Erro ao geocodificar endereço pendente:", error);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar pendingGeocode:", error);
        }
      }
    };
    
    syncPendingGeocode();
  }, [isOffline]);

  const handleMapPress = async (event: any) => {
    if (isOffline || !isMounted.current) return;
    
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      
      if (!isMounted.current) return;
      setCoords({ latitude, longitude });
      
      try {
        const address = await reverseGeocode(latitude, longitude);
        if (isMounted.current) {
          setLocation(address);
        }
      } catch (error) {
        console.error('Erro no reverseGeocode durante handleMapPress:', error);
      }
    } catch (error) {
      console.error('Erro no handleMapPress:', error);
    }
  };

  const handleSubmit = async () => {
    if (loading || !isMounted.current) return;
    
    setLoading(true);
    try {
      const isValid = await validateToken();
      if (!isValid || !isMounted.current) {
        setLoading(false);
        return;
      }

      if (!image) {
        Alert.alert("Erro", "Uma foto é obrigatória.");
        setLoading(false);
        return;
      }

      if (!location.trim()) {
        Alert.alert("Erro", "A localização é obrigatória.");
        setLoading(false);
        return;
      }

      const netInfo = await NetInfo.fetch();
      const isConnected = netInfo.isConnected && (await checkActualConnectivity());
      const token = await AsyncStorage.getItem("userToken");
      let playerId = null;
      
      try {
        playerId = await getPlayerId();
      } catch (error) {
        console.error("Erro ao obter playerId:", error);
      }
      
      const totalWeight = selectedTags.reduce((sum, tagName) => {
        const tag = availableTags.find((t) => t.name === tagName);
        return sum + (tag && tag.weight ? parseFloat(tag.weight) : 0);
      }, 0);
      
      const rankingLabel = totalWeight <= 120 ? "Baixo" : totalWeight <= 250 ? "Mediano" : "Urgente";

      const offlineId = Date.now().toString();
      const postData = {
        id: offlineId,
        offlineId: offlineId,
        title: title || "Interação sem título",
        description,
        tags: selectedTags,
        location,
        latitude: !isManualLocation && isConnected ? coords.latitude : null,
        longitude: !isManualLocation && isConnected ? coords.longitude : null,
        weight: totalWeight.toString(),
        ranking: rankingLabel,
        image,
        isOffline: !isConnected,
        createdAt: new Date().toISOString(),
      };

      if (!isConnected) {
        try {
          let imageUri = image;
          if (image) {
            const fileName = image.split("/").pop();
            const newUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.copyAsync({ from: image, to: newUri });
            imageUri = newUri;
            postData.image = imageUri;
          }

          const offlinePostsStr = await AsyncStorage.getItem("offlinePosts");
          const offlinePostsArray = offlinePostsStr ? JSON.parse(offlinePostsStr) : [];
          const alreadyExists = offlinePostsArray.find((p: any) => p.offlineId === postData.offlineId);
          if (!alreadyExists) {
            offlinePostsArray.push(postData);
            await AsyncStorage.setItem("offlinePosts", JSON.stringify(offlinePostsArray));
          }

          Alert.alert("Sucesso", "Postagem salva localmente.");
          if (isMounted.current) {
            router.push("/");
          }
        } catch (error) {
          console.error("Erro ao salvar dados offline:", error);
          Alert.alert("Erro", "Falha ao salvar dados offline.");
        } finally {
          if (isMounted.current) {
            setLoading(false);
          }
        }
        return;
      }

      try {
        const formData = new FormData();
        formData.append("title", postData.title);
        formData.append("content", postData.description || "");
        formData.append("tags", postData.tags.join(","));
        formData.append("location", postData.location);
        formData.append("latitude", postData.latitude?.toString() || "");
        formData.append("longitude", postData.longitude?.toString() || "");
        formData.append("playerId", playerId || "");
        formData.append("weight", postData.weight);
        formData.append("ranking", postData.ranking);
        formData.append("offlineId", postData.offlineId);

        if (postData.image) {
          const fileName = postData.image.split("/").pop();
          formData.append("image", {
            uri: postData.image,
            type: "image/jpeg",
            name: fileName || "image.jpg",
          } as any);
        }

        const response = await fetch(`${API_URL}/posts/create`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          const offlinePostsStr = await AsyncStorage.getItem("offlinePosts");
          if (offlinePostsStr) {
            let offlinePostsArray = JSON.parse(offlinePostsStr);
            offlinePostsArray = offlinePostsArray.filter((post: any) => post.offlineId !== postData.offlineId);
            await AsyncStorage.setItem("offlinePosts", JSON.stringify(offlinePostsArray));
          }
          
          if (isMounted.current) {
            router.push("/");
            setTitle("");
            setDescription("");
            setSelectedTags([]);
            setLocation("");
            setCoords({ latitude: 0, longitude: 0 });
            setImage(null);
            setSelectedDate(new Date().toISOString().split("T")[0]);
            setSelectedTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
          }
        } else {
          const data = await response.json();
          Alert.alert("Erro", data.message || "Falha ao criar interação.");
        }
      } catch (error) {
        console.error("Erro ao enviar dados para o servidor:", error);
        Alert.alert("Erro", "Ocorreu um problema ao enviar a interação para o servidor.");
      }
    } catch (error) {
      console.error("Erro geral em handleSubmit:", error);
      Alert.alert("Erro", "Ocorreu um problema ao salvar a interação.");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <FlatList
      data={["title", "date", "time", "description", "tags", "location", "map", "image", "buttons"]}
      renderItem={({ item }) => {
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
        if (item === "map") return (
          <MapViewComponent
            coords={coords}
            handleMapPress={handleMapPress}
            isManualLocation={isManualLocation}
            isOffline={isOffline}
          />
        );
        if (item === "image") return <ImagePickerComponent image={image} setImage={setImage} />;
        if (item === "buttons") return <SubmitButton loading={loading} handleSubmit={handleSubmit} router={router} isOffline={isOffline} />;
        return null;
      }}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16, paddingBottom: 80 },
});