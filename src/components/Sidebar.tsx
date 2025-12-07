'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Calculator,
    History,
    Package,
    Users,
    Settings,
    Sparkles,
    Menu,
    X,
    FileText,
    MessageSquare,
    ClipboardList
} from 'lucide-react';
import { useState, useEffect } from 'react';

/* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
interface SidebarProps { }

export default function Sidebar({ }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Дашборд', href: '/' },
        { icon: Calculator, label: 'Калькулятор', href: '/calculator' },
        { icon: MessageSquare, label: 'Чат', href: '/chat' },
        { icon: Users, label: 'Клиенты', href: '/clients' },
        { icon: ClipboardList, label: 'Заявки', href: '/requests' },
        { icon: FileText, label: 'Шаблоны', href: '/templates' },
        { icon: History, label: 'История', href: '/history' },
        { icon: Package, label: 'Каталог', href: '/catalog' },
        { icon: Sparkles, label: 'Галерея', href: '/gallery' },
        { icon: Settings, label: 'Настройки', href: '/settings' },
    ];

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-navy-deep/95 backdrop-blur-xl border-r border-white/10">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <Sparkles className="text-white" size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">MOS-POOL</h1>
                    <p className="text-xs text-gray-400">Estimator Pro</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto premium-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-gradient-primary text-white shadow-glow'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }
                            `}>
                                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-glow"
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 fixed inset-y-0 left-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy-deep/95 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Sparkles className="text-white" size={16} />
                    </div>
                    <span className="font-bold text-white">MOS-POOL</span>
                </div>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-80 z-50 md:hidden"
                        >
                            <div className="relative h-full">
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white z-10"
                                >
                                    <X size={24} />
                                </button>
                                <SidebarContent />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
