'use client';
import OptionCard from '../../premium/OptionCard';

interface FiltrationGridProps {
    options?: any[];
    selection?: any;
    onSelect?: (item: any) => void;
    requiredFlow?: number;
}

export default function FiltrationGrid({
    options = [],
    selection,
    onSelect,
    requiredFlow = 0
}: FiltrationGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((item: any, index: number) => {
                // Smart Suggestion Logic
                const flow = item.flowRate || 0;
                const isRecommended = flow >= requiredFlow && flow <= requiredFlow * 2.5;
                const isTooWeak = flow < requiredFlow;

                let badge: string | null = null;
                if (isRecommended) badge = "Рекомендуем";
                if (isTooWeak) badge = "Слабая мощность";

                return (
                    <OptionCard
                        key={item.id}
                        title={item.name}
                        description={item.description || `Производительность: ${item.flowRate} м³/ч`}
                        price={item.price}
                        image="⚙️"
                        selected={selection?.id === item.id}
                        onClick={() => onSelect?.(item)}
                        badge={badge}
                        delay={index * 0.05}
                    />
                );
            })}
        </div>
    );
}
