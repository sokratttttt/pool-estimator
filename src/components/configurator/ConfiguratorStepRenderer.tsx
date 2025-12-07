import { Suspense, lazy } from 'react';
import { LoadingSkeleton } from '../ui';

const MaterialStep = lazy(() => import('../steps/MaterialStep'));
const DimensionsStep = lazy(() => import('../steps/DimensionsStep'));
const BowlStep = lazy(() => import('../steps/BowlStep'));
const FiltrationStep = lazy(() => import('../steps/FiltrationStep'));
const HeatingStep = lazy(() => import('../steps/HeatingStep'));
const PartsStep = lazy(() => import('../steps/PartsStep'));
const WorksStep = lazy(() => import('../steps/WorksStep'));
const AdditionalStep = lazy(() => import('../steps/AdditionalStep'));
const SummaryStep = lazy(() => import('../steps/SummaryStep'));

interface ConfiguratorStepRendererProps {
    currentStep?: string;

}

export default function ConfiguratorStepRenderer({ currentStep }: ConfiguratorStepRendererProps) {


    const renderStep = () => {
        switch (currentStep) {
            case 'material': return <MaterialStep />;
            case 'dimensions': return <DimensionsStep />;
            case 'bowl': return <BowlStep />;
            case 'filtration': return <FiltrationStep />;
            case 'heating': return <HeatingStep />;
            case 'parts': return <PartsStep />;
            case 'works': return <WorksStep />;
            case 'additional': return <AdditionalStep />;
            case 'summary': return <SummaryStep />;
            default: return null;
        }
    };

    return (
        <Suspense fallback={<LoadingSkeleton type="grid" gridConfig={{ columns: 1, rows: 1 }} />}>
            {renderStep()}
        </Suspense>
    );
}
