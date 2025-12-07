'use client';
import { embeddedParts } from '../../data/parts';
import { useEstimate } from '../../context/EstimateContext';
import StepLayout from '../../components/StepLayout';
import { useRouter } from 'next/navigation';
import type { PartsSelection, PartItem } from '@/types';

export default function PartsSelection() {
    const { selection, updateSelection } = useEstimate();
    const router = useRouter();

    const handleSelect = (part: PartsSelection) => {
        updateSelection('parts', part);
        router.push('/summary');
    };

    return (
        <StepLayout title="Выберите материал закладных">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(embeddedParts as PartsSelection[]).map((part: PartsSelection) => (
                    <div
                        key={part.id}
                        className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg
              ${selection.parts?.id === part.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
            `}
                        onClick={() => handleSelect(part)}
                    >
                        <h3 className="text-xl font-semibold mb-4">{part.name}</h3>

                        <div className="space-y-3 text-sm text-gray-600">
                            {part.items?.map((item: PartItem, idx: number) => (
                                <div key={idx} className="flex justify-between border-b border-gray-50 py-2 last:border-0">
                                    <div>
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">Кол-во: {item.quantity}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</div>
                                        <div className="text-xs text-gray-500">Монтаж: {(item.installationPrice || 0).toLocaleString('ru-RU')} ₽</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-500">Итого оборудование:</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {part.items?.reduce((acc: number, item: PartItem) => acc + (item.price * item.quantity), 0).toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Итого монтаж:</span>
                                <span className="font-medium">
                                    {part.items?.reduce((acc: number, item: PartItem) => acc + (item.installationPrice || 0), 0).toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </StepLayout>
    );
}
