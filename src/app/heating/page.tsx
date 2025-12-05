'use client';
import { heatingOptions } from '../../data/heating';
import { useEstimate } from '../../context/EstimateContext';
import StepLayout from '../../components/StepLayout';
import { useRouter } from 'next/navigation';

export default function HeatingSelection() {
    const { selection, updateSelection } = useEstimate();
    const router = useRouter();

    const handleSelect = (option: any) => {
        updateSelection('heating', option);
        router.push('/parts');
    };

    return (
        <StepLayout title="Выберите тип подогрева">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {heatingOptions.map((option: any) => (
                    <div
                        key={option.id}
                        className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between
              ${selection.heating?.id === option.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
            `}
                        onClick={() => handleSelect(option)}
                    >
                        <div>
                            <h3 className="text-xl font-semibold mb-4">{option.name}</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                {option.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between border-b border-gray-50 py-1 last:border-0">
                                        <span className="truncate pr-2">{item.name}</span>
                                        <span className="font-medium whitespace-nowrap">{item.quantity} шт</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-500">Оборудование:</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {option.price.toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Монтаж:</span>
                                <span className="font-medium">
                                    {option.installationPrice.toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </StepLayout>
    );
}
