'use client';
import Configurator from '../../components/Configurator';
import { Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CalculatorPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Configurator />
        </Suspense>
    );
}
