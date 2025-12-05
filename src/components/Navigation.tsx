'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEstimate } from '../context/EstimateContext';

export default function Navigation() {
    const pathname = usePathname();
    const { selection } = useEstimate();

    const getSteps = () => {
        const baseSteps = [
            { path: '/', label: '1. Тип' },
        ];

        if (selection.material?.id === 'composite') {
            baseSteps.push({ path: '/bowls', label: '2. Чаша' });
        } else {
            baseSteps.push({ path: '/dimensions', label: '2. Размеры' });
        }

        baseSteps.push(
            { path: '/heating', label: '3. Подогрев' },
            { path: '/parts', label: '4. Закладные' },
            { path: '/summary', label: '5. Смета' }
        );

        return baseSteps;
    };

    const steps = getSteps();

    return (
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm mb-8 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex space-x-4 md:space-x-8 overflow-x-auto no-scrollbar w-full">
                        {steps.map((step) => (
                            <Link
                                key={step.path}
                                href={step.path}
                                className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-all rounded-full
                  ${pathname === step.path
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {step.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
