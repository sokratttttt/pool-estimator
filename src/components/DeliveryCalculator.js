'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Calculator } from 'lucide-react';
import AppleCard from './apple/AppleCard';
import AppleInput from './apple/AppleInput';
import AppleButton from './apple/AppleButton';

export default function DeliveryCalculator({ onCalculate }) {
    const [address, setAddress] = useState('');
    const [distance, setDistance] = useState('');
    const [deliveryCost, setDeliveryCost] = useState(null);

    // Pricing tiers
    const calculateDelivery = () => {
        const dist = parseFloat(distance);
        if (!dist || dist <= 0) return;

        let cost = 0;
        if (dist <= 10) {
            cost = 2000; // Бесплатно в пределах 10км
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

    return (
        <AppleCard>
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Truck size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="apple-heading-3">Калькулятор доставки</h3>
                        <p className="apple-caption text-apple-text-secondary">
                            Рассчитайте стоимость доставки
                        </p>
                    </div>
                </div>

                <AppleInput
                    label="Адрес доставки"
                    placeholder="Москва, ул. Примерная, 123"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    icon={<MapPin size={18} />}
                />

                <AppleInput
                    type="number"
                    label="Расстояние (км)"
                    placeholder="0"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    icon={<Calculator size={18} />}
                />

                <AppleButton
                    variant="primary"
                    onClick={calculateDelivery}
                    className="w-full"
                    disabled={!distance || parseFloat(distance) <= 0}
                >
                    Рассчитать
                </AppleButton>

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
