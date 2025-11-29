'use client';
import { useEstimate } from '@/context/EstimateContext';
import CatalogImporter from '../CatalogImporter';
import { EmptyState, LoadingSkeleton } from '../ui';
import { useHeatingLogic } from '@/hooks/useHeatingLogic';
import HeatingHeader from './heating/HeatingHeader';
import HeatingGrid from './heating/HeatingGrid';

export default function HeatingStep() {
    const { selection, updateSelection, catalog, isLoadingCatalog } = useEstimate();
    const { heatingOptions, handleSelect } = useHeatingLogic(catalog, selection, updateSelection);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <HeatingHeader />
                <CatalogImporter type="heating" />
            </div>

            {isLoadingCatalog ? (
                <LoadingSkeleton type="grid" gridConfig={{ columns: 3, rows: 2 }} />
            ) : heatingOptions.length === 0 ? (
                <EmptyState
                    title="Оборудование не найдено"
                    description="Загрузите каталог нагревателей или обратитесь к администратору"
                />
            ) : (
                <HeatingGrid
                    options={heatingOptions}
                    selection={selection.heating}
                    onSelect={handleSelect}
                />
            )}
        </div>
    );
}
