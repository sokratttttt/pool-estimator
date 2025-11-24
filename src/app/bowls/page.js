'use client';
import { bowls } from '../../data/bowls';
import { useEstimate } from '../../context/EstimateContext';
import StepLayout from '../../components/StepLayout';
import { useRouter } from 'next/navigation';

export default function PoolSelection() {
    const { selection, updateSelection } = useEstimate();
    const router = useRouter();

    const handleSelect = (bowl) => {
        updateSelection('bowl', bowl);
        // Reset dimensions if switching from other types, though flow shouldn't allow it easily
        updateSelection('dimensions', {
            length: bowl.length,
            width: bowl.width,
            depth: bowl.depth,
            volume: bowl.volume
        });
        router.push('/heating');
    };

    return (
        <StepLayout title="Выберите чашу бассейна">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bowls.map((bowl) => (
                    <div
                        key={bowl.id}
                        className={`glass-card rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl
              ${selection.bowl?.id === bowl.id ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}
            `}
                        onClick={() => handleSelect(bowl)}
                    >
                        <h3 className="text-2xl font-bold mb-2 text-gray-800">{bowl.name}</h3>
                        <p className="text-blue-600 font-medium mb-4">{bowl.manufacturer}</p>

                        <div className="space-y-3 text-sm text-gray-600 bg-white/50 p-4 rounded-lg">
                            <div className="flex justify-between">
                                <span>Длина:</span>
                                <span className="font-bold text-gray-900">{bowl.length} м</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ширина:</span>
                                <span className="font-bold text-gray-900">{bowl.width} м</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Глубина:</span>
                                <span className="font-bold text-gray-900">{bowl.depth} м</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Объем:</span>
                                <span className="font-bold text-gray-900">{bowl.volume} м³</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200/50 flex justify-between items-center">
                            <span className="text-gray-500">Стоимость чаши:</span>
                            <span className="text-2xl font-bold text-blue-700">
                                {bowl.price.toLocaleString('ru-RU')} ₽
                            </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-sm">
                            <span className="text-gray-500">Доставка:</span>
                            <span className="font-medium text-gray-700">
                                {bowl.deliveryPrice.toLocaleString('ru-RU')} ₽
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </StepLayout>
    );
}
