import Navigation from './Navigation';

export default function StepLayout({ children, title }) {
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
