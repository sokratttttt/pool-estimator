import React from 'react';
import Navigation from './Navigation';

interface StepLayoutProps {
    title: string;
    children?: React.ReactNode;
}

export default function StepLayout({ title, children }: StepLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navigation />
            <main className="container mx-auto px-4">
                {title && (
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
                )}
                {children}
            </main>
        </div>
    );
}
