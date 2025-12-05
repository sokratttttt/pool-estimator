'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEstimate } from '@/context/EstimateContext';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { generateEstimateItems, calculateTotal } from '@/utils/estimateUtils';
import ConfiguratorHeader from './configurator/ConfiguratorHeader';
import ConfiguratorFooter from './configurator/ConfiguratorFooter';
import ConfiguratorStepRenderer from './configurator/ConfiguratorStepRenderer';

interface ConfiguratorProps {

}

export default function Configurator({ }: ConfiguratorProps) {
    const { selection, undo, redo, canUndo, canRedo, lastSaved } = useEstimate();
    const searchParams = useSearchParams();
    const [, forceUpdate] = useState(0);

    // Use step navigation hook
    const navigation = useStepNavigation(selection, searchParams);

    // Update timestamp display every second
    useEffect(() => {
        if (!lastSaved) return;
        const interval = setInterval(() => {
            forceUpdate(n => n + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [lastSaved]);

    // Keyboard navigation
    useKeyboardNavigation({
        handleNext: navigation.handleNext,
        handleBack: navigation.handleBack,
        undo,
        redo,
        canUndo,
        canRedo,
        canGoNext: navigation.canGoNext,
        canGoBack: navigation.canGoBack
    });

    // Calculate total
    const { total } = useMemo(() => {
        const items = generateEstimateItems(selection);
        const total = calculateTotal(items);
        return { total };
    }, [selection]);

    return (
        <div className="min-h-screen bg-apple-bg-primary">
            <ConfiguratorHeader
                currentStepIndex={navigation.currentStepIndex}
                visibleSteps={navigation.visibleSteps}
                steps={navigation.steps}
                currentStepData={navigation.currentStepData}
                undo={undo}
                redo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                lastSaved={lastSaved}
                total={total}
                onStepClick={navigation.goToStepByIndex}
            />

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-6 py-8 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={navigation.currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ConfiguratorStepRenderer currentStep={navigation.currentStep} />
                    </motion.div>
                </AnimatePresence>
            </main>

            <ConfiguratorFooter
                currentStepIndex={navigation.currentStepIndex}
                visibleSteps={navigation.visibleSteps}
                handleNext={navigation.handleNext}
                handleBack={navigation.handleBack}
                canGoNext={navigation.canGoNext}
                canGoBack={navigation.canGoBack}
            />
        </div>
    );
}
