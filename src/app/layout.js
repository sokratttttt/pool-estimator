import VersionChecker from '@/components/VersionChecker';

// В body перед {children}:
<VersionChecker />
import "./globals.css";
import { EstimateProvider } from "../context/EstimateContext";
import { TemplateProvider } from "../context/TemplateContext";
import { HistoryProvider } from "../context/HistoryContext";
import { CatalogProvider } from "../context/CatalogContext";
import { ThemeProvider } from "../context/ThemeContext";
import { BackupProvider } from "../context/BackupContext";
import { SyncProvider } from "../context/SyncContext";
import { ClientProvider } from "../context/ClientContext";
import { Toaster } from 'sonner';
import { Inter, Montserrat } from 'next/font/google';
import MainNav from '../components/MainNav';

const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-inter',
    display: 'swap',
});

const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-montserrat',
    display: 'swap',
});

export const metadata = {
    title: "MOS-POOL Estimator | Калькулятор бассейнов",
    description: "Профессиональный калькулятор для расчета стоимости строительства бассейнов. Быстрое создание смет с экспортом в PDF и Excel.",
    keywords: "бассейн, смета, калькулятор, строительство, оборудование",
    authors: [{ name: 'MOS-POOL' }],
    openGraph: {
        title: 'MOS-POOL Estimator',
        description: 'Калькулятор бассейнов - создание смет онлайн',
        type: 'website',
    },
    icons: {
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏊</text></svg>",
    },
};

import Sidebar from '../components/Sidebar';

export default function RootLayout({ children }) {
    return (
        <html lang="ru" className={`${inter.variable} ${montserrat.variable}`}>
            <body className="min-h-screen bg-navy-deep text-white antialiased overflow-x-hidden">
                <ThemeProvider>
                    <SyncProvider>
                        <ClientProvider>
                            <BackupProvider>
                                <EstimateProvider>
                                    <TemplateProvider>
                                        <HistoryProvider>
                                            <CatalogProvider>
                                                <div className="flex min-h-screen">
                                                    <Sidebar />
                                                    <main className="flex-1 md:pl-72 pt-16 md:pt-0 min-w-0 transition-all duration-300">
                                                        {children}
                                                    </main>
                                                </div>
                                                <Toaster position="top-right" richColors theme="dark" />
                                            </CatalogProvider>
                                        </HistoryProvider>
                                    </TemplateProvider>
                                </EstimateProvider>
                            </BackupProvider>
                        </ClientProvider>
                    </SyncProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

