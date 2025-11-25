'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Calendar, DollarSign } from 'lucide-react';
import MapFilters from './MapFilters';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons by pool type
const poolTypeIcons = {
    premium: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    standard: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    sport: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    kids: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    infinity: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
};

export default function MapView({ projects, filters, setFilters }) {
    // Center on Moscow
    const center = [55.7558, 37.6173];

    return (
        <div className="relative w-full h-full">
            <MapFilters filters={filters} setFilters={setFilters} projectCount={projects.length} />

            <MapContainer
                center={center}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {projects.map((project) => (
                    <Marker
                        key={project.id}
                        position={[parseFloat(project.latitude), parseFloat(project.longitude)]}
                        icon={poolTypeIcons[project.pool_type] || poolTypeIcons.standard}
                    >
                        <Popup maxWidth={300}>
                            <div className="p-2">
                                <h3 className="font-bold text-lg mb-2 text-gray-900">{project.name}</h3>

                                <div className="flex items-start gap-2 mb-2 text-sm text-gray-600">
                                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{project.address}</span>
                                </div>

                                {project.description && (
                                    <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-2">
                                    {project.completion_date && (
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{new Date(project.completion_date).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                    )}
                                    {project.budget && (
                                        <div className="flex items-center gap-1">
                                            <DollarSign size={14} />
                                            <span>{(project.budget / 1000000).toFixed(1)}M ₽</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
