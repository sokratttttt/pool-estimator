import VersionChecker from '@/components/VersionChecker';
import PageTransition from '@/components/PageTransition';
import "./globals.css";
import { EstimateProvider } from "../context/EstimateContext";
import { TemplateProvider } from "../context/TemplateContext";
import { HistoryProvider } from "../context/HistoryContext";
import { CatalogProvider } from "../context/CatalogContext";
import { EquipmentCatalogProvider } from "../context/EquipmentCatalogContext";
import { ThemeProvider } from "../context/ThemeContext";
import { PhotoProvider } from "../context/PhotoContext";
import { BackupProvider } from "../context/BackupContext";
import { SyncProvider } from "../context/SyncContext";
import { ClientProvider } from "../context/ClientContext";
import { RequestsProvider } from "../context/RequestsContext";
import { SettingsProvider } from "../context/SettingsContext";
import { GlobalShortcutsProvider } from "../components/providers/GlobalShortcutsProvider";
import QueryClientProvider from "../providers/QueryClientProvider";
import { Toaster } from 'sonner';
import { Inter, Montserrat } from 'next/font/google';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';

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
        icon: "/icon.png",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
            <body className="min-h-screen bg-navy-deep text-white antialiased overflow-x-hidden">
                <QueryClientProvider>
                    <ThemeProvider>
                        <PhotoProvider>
                            <SyncProvider>
                                <ClientProvider>
                                    <RequestsProvider>
                                        <BackupProvider>
                                            <CatalogProvider>
                                                <EquipmentCatalogProvider>
                                                    <EstimateProvider>
                                                        <TemplateProvider>
                                                            <HistoryProvider>
                                                                <SettingsProvider>
                                                                    <GlobalShortcutsProvider>
                                                                        <ProfessionalLayout>
                                                                            <VersionChecker />
                                                                            <PageTransition>
                                                                                {children}
                                                                            </PageTransition>
                                                                        </ProfessionalLayout>
                                                                        <Toaster position="top-right" richColors theme="dark" />
                                                                    </GlobalShortcutsProvider>
                                                                </SettingsProvider>
                                                            </HistoryProvider>
                                                        </TemplateProvider>
                                                    </EstimateProvider>
                                                </EquipmentCatalogProvider>
                                            </CatalogProvider>
                                        </BackupProvider>
                                    </RequestsProvider>
                                </ClientProvider>
                            </SyncProvider>
                        </PhotoProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </body>
        </html>
    );
}
