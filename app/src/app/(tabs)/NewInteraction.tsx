import React, { useState, useEffect, useRef } from "react";
import { FlatList, Alert, StyleSheet, Text } from "react-native";
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
import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";

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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState(
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const isMounted = useRef(true);

  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const checkActualConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${API_URL}/ping`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);
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

            const locationData = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000,
              distanceInterval: 0,
            });

            if (!isMounted.current) return;

            if (locationData && locationData.coords) {
              const { latitude, longitude } = locationData.coords;
              console.log("Coordenadas obtidas:", latitude, longitude);
              setCoords({ latitude, longitude });

              try {
                const address = await reverseGeocode(latitude, longitude);
                if (isMounted.current) {
                  if (address.includes("Erro")) {
                    Alert.alert("Erro", address);
                    setLocation("Endereço não encontrado");
                  } else {
                    setLocation(address);
                  }
                }
              } catch (error) {
                console.error("Erro no reverse geocoding:", error);
                if (isMounted.current) {
                  setLocation("Erro ao obter endereço");
                  Alert.alert("Erro", "Não foi possível obter o endereço. Verifique sua conexão de internet.");
                }
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
  }, []);

  const handleSubmit = async () => {
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

      const totalWeight = selectedTags.reduce((sum, tagName) => {
        const tag = availableTags.find((t) => t.name === tagName);
        return sum + (tag && tag.weight ? parseFloat(tag.weight) : 0);
      }, 0);

      const ranking = totalWeight <= 250 ? "Baixo" : totalWeight <= 350 ? "Mediano" : "Urgente";

      if (isOffline) {
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
          offlineId: Date.now().toString(),
        };

        const offlinePosts = JSON.parse(await AsyncStorage.getItem("offlinePosts") || "[]");
        offlinePosts.push(offlinePost);
        await AsyncStorage.setItem("offlinePosts", JSON.stringify(offlinePosts));

        Alert.alert(
          "Sucesso",
          "Postagem salva offline. Será enviada ao servidor quando a conexão for restabelecida."
        );
        router.push("/");
        setLoading(false);
        setStatus("saved");
        return;
      }

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
      };

      const formData = new FormData();
      Object.keys(postData).forEach((key) => {
        formData.append(key, postData[key]);
      });

      if (image) {
        const fileName = image.split("/").pop();
        formData.append("image", {
          uri: image,
          type: "image/jpeg",
          name: fileName || "image.jpg",
        } as any);
      }

      const response = await fetch(`${API_URL}/posts/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Postagem criada com sucesso!");
        router.push("/");
      } else {
        const errorData = await response.json();
        Alert.alert("Erro", errorData.message || "Erro ao criar postagem.");
      }
    } catch (error) {
      console.error("Erro ao enviar postagem:", error);
      Alert.alert("Erro", "Ocorreu um problema ao salvar a postagem.");
    } finally {
      setLoading(false);
      setStatus("idle");
    }
  };

  const renderItem = ({ item }: { item: string }) => {
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
    if (item === "map" && !isLocationLoading && coords) return (
      <MapViewComponent
        coords={coords}
        handleMapPress={(event) => {
          const { latitude, longitude } = event.nativeEvent.coordinate;
          setCoords({ latitude, longitude });
        }}
        isManualLocation={isManualLocation}
        isOffline={isOffline}
      />
    );
    if (item === "image") return (
      <ImagePickerComponent
        image={image}
        setImage={(uri) => {
          setIsImageLoading(true);
          setImage(uri);
          setIsImageLoading(false);
        }}
      />
    );
    if (item === "buttons") return (
      <SubmitButton
        loading={loading || isImageLoading}
        handleSubmit={handleSubmit}
        router={router}
        isOffline={isOffline}
        status={status}
      />
    );
    return null;
  };

  return (
    <FlatList
      data={["title", "date", "time", "description", "tags", "location", "map", "image", "buttons"]}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.container}
      ListHeaderComponent={isLocationLoading ? <Text style={styles.loadingText}>Carregando localização...</Text> : null}
    />
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 16, paddingBottom: 80 },
  loadingText: { textAlign: "center", color: "#666", marginVertical: 16 },
});