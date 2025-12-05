'use client';

// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L, { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red icon for destination
const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom green icon for base
const baseIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapClickHandlerProps {
    onMapClick?: (coords: { lat: number; lng: number }) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
    useMapEvents({
        click: (e: LeafletMouseEvent) => {
            onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
    });
    return null;
}

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

interface DeliveryMapProps {
    baseLocation: Location;
    destinationCoords?: Location;
    onMapClick?: (coords: { lat: number; lng: number }) => void;
}

export default function DeliveryMap({ baseLocation, destinationCoords, onMapClick }: DeliveryMapProps) {
    const center = destinationCoords
        ? [(baseLocation.lat + destinationCoords.lat) / 2, (baseLocation.lng + destinationCoords.lng) / 2]
        : [baseLocation.lat, baseLocation.lng];

    const zoom = destinationCoords ? 10 : 11;

    return (
        <div className="rounded-lg overflow-hidden border border-gray-700">
            {/* @ts-ignore - React Leaflet types issue */}
            <MapContainer
                center={center as L.LatLngExpression}
                zoom={zoom}
                style={{ height: '400px', width: '100%' }}
                className="z-0"
            >
                {/* @ts-ignore - React Leaflet types issue */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onMapClick={onMapClick} />

                {/* Base marker */}
                {/* @ts-ignore - React Leaflet types issue */}
                <Marker position={[baseLocation.lat, baseLocation.lng]} icon={baseIcon}>
                    <Popup>
                        <div className="text-center">
                            <strong>📍 База</strong>
                            <p className="text-xs text-gray-600 mt-1">{baseLocation.address}</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Destination marker */}
                {destinationCoords && (
                    <>
                        {/* @ts-ignore - React Leaflet types issue */}
                        <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon}>
                            <Popup>
                                <div className="text-center">
                                    <strong>🏁 Адрес доставки</strong>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Line between points */}
                        <Polyline
                            positions={[
                                [baseLocation.lat, baseLocation.lng],
                                [destinationCoords.lat, destinationCoords.lng]
                            ]}
                            pathOptions={{
                                color: '#10b981',
                                weight: 3,
                                opacity: 0.7,
                                dashArray: '10, 10'
                            }}
                        />
                    </>
                )}
            </MapContainer>

            <div className="bg-gray-800 p-2 text-xs text-gray-400 text-center">
                Кликните на карту, чтобы выбрать точку доставки
            </div>
        </div>
    );
}
