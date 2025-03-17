import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";

interface MapModalProps {
    latitude: number;
    longitude: number;
    title: string;
}

const MapModal: React.FC<MapModalProps> = ({ latitude, longitude, title }) => {
    const position: LatLngExpression = [latitude, longitude];

    return (
        <MapContainer
            center={position}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
                <Popup>{title}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapModal;