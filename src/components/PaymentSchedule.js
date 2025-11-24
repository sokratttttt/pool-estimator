'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, CheckCircle } from 'lucide-react';
import AppleCard from './apple/AppleCard';
import AppleButton from './apple/AppleButton';

export default function PaymentSchedule({ totalAmount }) {
    const [selectedPlan, setSelectedPlan] = useState('standard');

    const plans = {
        full: {
            name: 'Полная оплата',
            discount: 5,
            stages: [
                { name: 'Полная оплата', percent: 100, timing: 'При заказе' }
            ]
        },
        standard: {
            name: 'Стандартный',
            discount: 0,
            stages: [
                { name: 'Аванс', percent: 30, timing: 'При заказе' },
                { name: 'Промежуточный', percent: 40, timing: 'Начало работ' },
                { name: 'Финальный', percent: 30, timing: 'Завершение' }
            ]
        },
        extended: {
            name: 'Расширенный',
            discount: -3,
            stages: [
                { name: 'Аванс', percent: 20, timing: 'При заказе' },
                { name: 'Этап 1', percent: 20, timing: 'Подготовка' },
                { name: 'Этап 2', percent: 20, timing: 'Монтаж' },
                { name: 'Этап 3', percent: 20, timing: 'Оборудование' },
                { name: 'Финальный', percent: 20, timing: 'Завершение' }
            ]
        }
    };

    const currentPlan = plans[selectedPlan];
    const discountMultiplier = 1 + (currentPlan.discount / 100);
    const finalAmount = totalAmount * discountMultiplier;

    return (
        <AppleCard>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Calendar size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="apple-heading-3">График платежей</h3>
                        <p className="apple-caption text-apple-text-secondary">
                            Выберите удобный план оплаты
                        </p>
                    </div>
                </div>

                {/* Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(plans).map(([key, plan]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedPlan(key)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${selectedPlan === key
                                    ? 'border-apple-primary bg-apple-primary/10'
                                    : 'border-apple-border hover:border-apple-primary/50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="apple-body font-semibold">{plan.name}</h4>
                                {selectedPlan === key && (
                                    <CheckCircle size={20} className="text-apple-primary" />
                                )}
                            </div>
                            <p className="apple-caption text-apple-text-secondary">
                                {plan.stages.length} {plan.stages.length === 1 ? 'платеж' : 'платежа'}
                            </p>
                            {plan.discount !== 0 && (
                                <p className={`apple-caption font-semibold mt-1 ${plan.discount > 0 ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                    {plan.discount > 0 ? '-' : '+'}{Math.abs(plan.discount)}%
                                </p>
                            )}
                        </button>
                    ))}
                </div>

                {/* Payment Stages */}
                <div className="space-y-3">
                    {currentPlan.stages.map((stage, index) => {
                        const amount = (finalAmount * stage.percent) / 100;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-apple-bg-secondary rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-apple-primary text-white flex items-center justify-center text-sm font-semibold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="apple-body font-medium">{stage.name}</p>
                                        <p className="apple-caption text-apple-text-secondary">
                                            {stage.timing} • {stage.percent}%
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="apple-heading-3 text-apple-primary">
                                        {amount.toLocaleString('ru-RU')} ₽
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-apple-border">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="apple-body font-semibold">Итого к оплате:</p>
                            {currentPlan.discount !== 0 && (
                                <p className="apple-caption text-apple-text-secondary">
                                    {currentPlan.discount > 0 ? 'Скидка' : 'Наценка'}: {Math.abs(currentPlan.discount)}%
                                </p>
                            )}
                        </div>
                        <p className="apple-heading-1 text-apple-primary">
                            {finalAmount.toLocaleString('ru-RU')} ₽
                        </p>
                    </div>
                </div>
            </div>
        </AppleCard>
    );
}
