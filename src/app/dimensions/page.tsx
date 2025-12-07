'use client';
import { useState } from 'react';
import { useEstimate } from '../../context/EstimateContext';
import StepLayout from '../../components/StepLayout';
import { useRouter } from 'next/navigation';

export default function DimensionsInput() {
    const { selection, updateSelection } = useEstimate();
    const router = useRouter();

    const [dims, setDims] = useState(selection.dimensions || { length: '', width: '', depth: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDims(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const length = Number(dims.length);
        const width = Number(dims.width);
        const depth = Number(dims.depth);

        if (length && width && depth) {
            const volume = length * width * depth;
            updateSelection('dimensions', { length, width, depth, volume });
            router.push('/heating');
        }
    };

    return (
        <StepLayout title="Укажите размеры бассейна">
            <div className="max-w-md mx-auto glass-card p-8 rounded-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Длина (м)</label>
                        <input
                            type="number"
                            name="length"
                            value={dims.length}
                            onChange={handleChange}
                            step="0.1"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Например, 8.0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ширина (м)</label>
                        <input
                            type="number"
                            name="width"
                            value={dims.width}
                            onChange={handleChange}
                            step="0.1"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Например, 4.0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Глубина (м)</label>
                        <input
                            type="number"
                            name="depth"
                            value={dims.depth}
                            onChange={handleChange}
                            step="0.1"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Например, 1.5"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Продолжить
                        </button>
                    </div>
                </form>
            </div>
        </StepLayout>
    );
}
