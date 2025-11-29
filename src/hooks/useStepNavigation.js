import { useState, useEffect, useCallback, useMemo } from 'react';

const steps = [
    { id: 'material', label: 'Тип' },
    { id: 'dimensions', label: 'Размеры' },
    { id: 'bowl', label: 'Чаша' },
    { id: 'filtration', label: 'Фильтрация' },
    { id: 'heating', label: 'Подогрев' },
    { id: 'parts', label: 'Закладные' },
    { id: 'works', label: 'Работы' },
    { id: 'additional', label: 'Опции' },
    { id: 'summary', label: 'Смета' },
];

export const useStepNavigation = (selection, searchParams) => {
    const [currentStep, setCurrentStep] = useState('material');

    // Calculate visible steps based on material selection
    const visibleSteps = useMemo(() => {
        let visible = ['material'];
        if (selection.material?.id === 'composite') {
            visible.push('bowl');
        } else {
            visible.push('dimensions');
        }
        visible.push('filtration', 'heating', 'parts', 'works', 'additional', 'summary');
        return visible;
    }, [selection.material]);

    const currentStepIndex = visibleSteps.indexOf(currentStep);
    const currentStepData = steps.find(s => s.id === currentStep);

    // Handle step query parameter
    useEffect(() => {
        const stepParam = searchParams.get('step');
        if (stepParam && steps.find(s => s.id === stepParam)) {
            setCurrentStep(stepParam);
        }
    }, [searchParams]);

    // Ensure we don't get stuck on a hidden step
    useEffect(() => {
        if (!visibleSteps.includes(currentStep)) {
            setCurrentStep('material');
        }
    }, [selection.material, currentStep, visibleSteps]);

    const handleNext = useCallback(() => {
        if (currentStepIndex < visibleSteps.length - 1) {
            setCurrentStep(visibleSteps[currentStepIndex + 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentStepIndex, visibleSteps]);

    const handleBack = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStep(visibleSteps[currentStepIndex - 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentStepIndex, visibleSteps]);

    const goToStep = useCallback((stepId) => {
        if (visibleSteps.includes(stepId)) {
            setCurrentStep(stepId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [visibleSteps]);

    const goToStepByIndex = useCallback((index) => {
        if (index >= 0 && index < visibleSteps.length) {
            setCurrentStep(visibleSteps[index]);
        }
    }, [visibleSteps]);

    return {
        currentStep,
        currentStepIndex,
        currentStepData,
        visibleSteps,
        steps,
        handleNext,
        handleBack,
        goToStep,
        goToStepByIndex,
        canGoNext: currentStepIndex < visibleSteps.length - 1,
        canGoBack: currentStepIndex > 0,
        isFirstStep: currentStepIndex === 0,
        isLastStep: currentStepIndex === visibleSteps.length - 1,
    };
};
