import React, { useEffect } from 'react';
import L from 'leaflet';

interface MapModalProps {
    latitude: number;
    longitude: number;
    title: string;
}

const MapModal: React.FC<MapModalProps> = ({ latitude, longitude, title }) => {
    useEffect(() => {
        const mapContainer = document.getElementById('map');

        if (!mapContainer) return;

        // Clear any existing map
        mapContainer.innerHTML = '';

        // Create map
        const map = L.map('map').setView([latitude, longitude], 16);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(title).openPopup();

        // Clean up map when component unmounts
        return () => {
            map.remove();
        };
    }, [latitude, longitude, title]);

    return (
        <div id="map" className="h-96 w-full rounded-lg shadow"></div>
    );
};

export default MapModal;