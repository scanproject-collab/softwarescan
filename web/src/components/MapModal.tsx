import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapModalProps {
    latitude: number;
    longitude: number;
    title: string;
}

const MapModal: React.FC<MapModalProps> = ({ latitude, longitude, title }) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mapRef.current) {
            // Limpar o mapa se já existir
            mapRef.current.innerHTML = "";

            // Criar novo mapa
            const map = L.map(mapRef.current).setView([latitude, longitude], 13);

            // Adicionar camada do OpenStreetMap
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Adicionar marcador
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(title)
                .openPopup();

            // Limpar o mapa quando componente for desmontado
            return () => {
                map.remove();
            };
        }
    }, [latitude, longitude, title]);

    return (
        <div
            ref={mapRef}
            style={{ height: "400px", width: "100%" }}
            className="rounded-md shadow-md"
        />
    );
};

export default MapModal;