'use client';
import { Calculator } from 'lucide-react';

interface WorksSummaryProps {
  grandTotal?: any;
  selectedCount?: any;
}

export default function WorksSummary({  grandTotal, selectedCount  }: WorksSummaryProps) {
    return (
        <div className="bg-gradient-to-r from-[#00b4d8] to-[#0096c7] rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calculator size={32} />
                    <div>
                        <div className="text-sm opacity-90">Итого работы:</div>
                        <div className="text-3xl font-bold">{grandTotal.toLocaleString('ru-RU')} ₽</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm opacity-90">Выбрано позиций:</div>
                    <div className="text-2xl font-bold">{selectedCount}</div>
                </div>
            </div>
        </div>
    );
}
