'use client';
import { useEstimate } from '@/context/EstimateContext';
import { useWorksLogic } from '@/hooks/useWorksLogic';
import WorksHeader from './works/WorksHeader';
import WorksSummary from './works/WorksSummary';
import WorksCategory from './works/WorksCategory';

export default function WorksStep() {
    const { selection, updateSelection } = useEstimate();
    const {
        selectedWorks,
        editingWork,
        editValue,
        setEditValue,
        toggleWork,
        startEdit,
        saveEdit,
        cancelEdit,
        grandTotal,
        categoryTotals,
        works,
        workCategories
    } = useWorksLogic(selection, updateSelection);

    return (
        <div className="space-y-6 pb-20">
            <WorksHeader />

            <WorksSummary
                grandTotal={grandTotal}
                selectedCount={Object.keys(selectedWorks).length}
            />

            {Object.entries(workCategories).map(([categoryKey, category]) => {
                const categoryWorks = (works as Record<string, unknown>)[categoryKey];
                const categoryTotal = categoryTotals[categoryKey] || 0;

                return (
                    <WorksCategory
                        key={categoryKey}
                        categoryKey={categoryKey}
                        category={category as { name: string; description: string; icon: React.ReactNode }}
                        categoryWorks={categoryWorks as unknown as Parameters<typeof WorksCategory>[0]['categoryWorks']}
                        categoryTotal={categoryTotal}
                        selectedWorks={selectedWorks as unknown as Parameters<typeof WorksCategory>[0]['selectedWorks']}
                        editingWork={editingWork}
                        editValue={editValue}
                        onEditValueChange={setEditValue}
                        onToggleWork={toggleWork}
                        onStartEdit={startEdit}
                        onSaveEdit={saveEdit}
                        onCancelEdit={cancelEdit}
                    />
                );
            })}
        </div>
    );
}
