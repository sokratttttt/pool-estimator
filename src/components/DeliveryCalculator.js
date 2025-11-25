'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Calculator, Map, X } from 'lucide-react';
import AppleCard from './apple/AppleCard';
import AppleInput from './apple/AppleInput';
import AppleButton from './apple/AppleButton';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamic import to avoid SSR issues
const DeliveryMap = dynamic(() => import('./DeliveryMap'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
});

// Base location (можно изменить на ваш офис/склад)
const BASE_LOCATION = {
    lat: 55.7558, // Москва, центр
    lng: 37.6173,
    address: 'Москва, база'
};

export default function DeliveryCalculator({ onCalculate }) {
    const [address, setAddress] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [distance, setDistance] = useState('');
    const [deliveryCost, setDeliveryCost] = useState(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Geocode address using Nominatim (OpenStreetMap)
    const geocodeAddress = async () => {
        if (!address.trim()) {
            toast.error('Введите адрес');
            return;
        }

        setIsGeocoding(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ru`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.length > 0) {
                const coords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                setDestinationCoords(coords);

                // Calculate distance
                const dist = calculateDistance(
                    BASE_LOCATION.lat,
                    BASE_LOCATION.lng,
                    coords.lat,
                    coords.lng
                );
                setDistance(Math.round(dist).toString());
                setShowMap(true);
                toast.success('Адрес найден!');
            } else {
                toast.error('Адрес не найден. Попробуйте уточнить.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Ошибка поиска адреса');
        } finally {
            setIsGeocoding(false);
        }
    };

    // Pricing tiers
    const calculateDelivery = () => {
        const dist = parseFloat(distance);
        if (!dist || dist <= 0) return;

        let cost = 0;
        if (dist <= 10) {
            cost = 2000; // Базовая стоимость до 10км
        } else if (dist <= 50) {
            cost = 2000 + (dist - 10) * 100; // 100₽/км после 10км
        } else if (dist <= 100) {
            cost = 6000 + (dist - 50) * 80; // 80₽/км после 50км
        } else {
            cost = 10000 + (dist - 100) * 60; // 60₽/км после 100км
        }

        setDeliveryCost(Math.round(cost));
        if (onCalculate) {
            onCalculate({ address, distance: dist, cost: Math.round(cost) });
        }
    };

    const handleMapClick = useCallback((coords) => {
        const dist = calculateDistance(
            BASE_LOCATION.lat,
            BASE_LOCATION.lng,
            coords.lat,
            coords.lng
        );
        setDestinationCoords(coords);
        setDistance(Math.round(dist).toString());
    }, []);

    return (
        <AppleCard>
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Truck size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="apple-heading-3">Калькулятор доставки</h3>
                            <p className="apple-caption text-apple-text-secondary">
                                Рассчитайте стоимость по карте
                            </p>
                        </div>
                    </div>
                    <AppleButton
                        variant={showMap ? 'secondary' : 'primary'}
                        onClick={() => setShowMap(!showMap)}
                        icon={showMap ? <X size={18} /> : <Map size={18} />}
                        size="sm"
                    >
                        {showMap ? 'Скрыть' : 'Карта'}
                    </AppleButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                        <AppleInput
                            label="Адрес доставки"
                            placeholder="Москва, ул. Примерная, 123"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            icon={<MapPin size={18} />}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') geocodeAddress();
                            }}
                        />
                    </div>
                    <AppleButton
                        variant="primary"
                        onClick={geocodeAddress}
                        disabled={!address.trim() || isGeocoding}
                        className="md:mt-6"
                    >
                        {isGeocoding ? 'Поиск...' : 'Найти'}
                    </AppleButton>
                </div>

                {/* Map */}
                <AnimatePresence>
                    {showMap && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <DeliveryMap
                                baseLocation={BASE_LOCATION}
                                destinationCoords={destinationCoords}
                                onMapClick={handleMapClick}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-3">
                    <AppleInput
                        type="number"
                        label="Расстояние (км)"
                        placeholder="0"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        icon={<Calculator size={18} />}
                        disabled
                    />
                    <AppleButton
                        variant="primary"
                        onClick={calculateDelivery}
                        className="mt-6"
                        disabled={!distance || parseFloat(distance) <= 0}
                    >
                        Рассчитать
                    </AppleButton>
                </div>

                {deliveryCost !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-apple-bg-secondary rounded-lg"
                    >
                        <div className="flex justify-between items-center">
                            <span className="apple-body">Стоимость доставки:</span>
                            <span className="apple-heading-2 text-apple-primary">
                                {deliveryCost.toLocaleString('ru-RU')} ₽
                            </span>
                        </div>
                        <div className="mt-2 space-y-1 text-apple-text-secondary apple-caption">
                            <p>• До 10 км: 2 000 ₽</p>
                            <p>• 10-50 км: +100 ₽/км</p>
                            <p>• 50-100 км: +80 ₽/км</p>
                            <p>• Более 100 км: +60 ₽/км</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </AppleCard>
    );
}
