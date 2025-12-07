'use client';
import { useEstimate } from '@/context/EstimateContext';
import CatalogImporter from '../CatalogImporter';
import { EmptyState, LoadingSkeleton } from '../ui';
import { useFiltrationLogic } from '@/hooks/useFiltrationLogic';
import FiltrationHeader from './filtration/FiltrationHeader';
import FiltrationCalculator from './filtration/FiltrationCalculator';
import FiltrationGrid from './filtration/FiltrationGrid';

export default function FiltrationStep() {
    const { selection, updateSelection, catalog, isLoadingCatalog } = useEstimate();

    const {
        turnoverTime,
        setTurnoverTime,
        displayOptions,
        requiredFlow,
        volume,
        handleSelect,
        turnoverOptions
    } = useFiltrationLogic(catalog, selection, updateSelection);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <FiltrationHeader />
                <CatalogImporter type={"filtration" as "bowls" | "equipment"} />
            </div>

            <FiltrationCalculator
                turnoverTime={turnoverTime}
                setTurnoverTime={setTurnoverTime}
                turnoverOptions={turnoverOptions}
                volume={volume}
                requiredFlow={requiredFlow}
            />

            {isLoadingCatalog ? (
                <LoadingSkeleton type="grid" gridConfig={{ columns: 3, rows: 2 }} />
            ) : displayOptions.length === 0 ? (
                <EmptyState
                    title="Оборудование не найдено"
                    description="Загрузите каталог фильтрации или обратитесь к администратору"
                />
            ) : (
                <FiltrationGrid
                    options={displayOptions as unknown as Parameters<typeof FiltrationGrid>[0]['options']}
                    selection={selection.filtration as unknown as Parameters<typeof FiltrationGrid>[0]['selection']}
                    onSelect={handleSelect as unknown as Parameters<typeof FiltrationGrid>[0]['onSelect']}
                    requiredFlow={requiredFlow}
                />
            )}
        </div>
    );
}
