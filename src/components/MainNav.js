'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, Package, History, Settings, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainNav() {
    const pathname = usePathname();

    const navItems = [
        { id: 'calculator', label: 'Калькулятор', icon: Calculator, href: '/calculator' },
        { id: 'catalog', label: 'Каталог', icon: Package, href: '/catalog' },
        { id: 'gallery', label: 'Галерея', icon: ImageIcon, href: '/gallery' },
        { id: 'history', label: 'История', icon: History, href: '/history' },
        { id: 'settings', label: 'Настройки', icon: Settings, href: '/settings' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50" style={{
            background: 'rgba(10, 25, 41, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-gradient">
                                MOS-POOL
                            </div>
                        </motion.div>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className="relative"
                                >
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg
                                            transition-all duration-200
                                            ${isActive
                                                ? 'bg-gradient-primary text-white shadow-glow'
                                                : 'text-gray-300 hover:bg-surface-glass hover:text-white'
                                            }
                                        `}
                                    >
                                        <Icon size={18} />
                                        <span className="font-medium">{item.label}</span>
                                    </motion.div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0" style={{
                background: 'rgba(10, 25, 41, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div className="flex justify-around p-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="relative"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        flex flex-col items-center gap-1 p-2 rounded-lg
                                        transition-colors
                                        ${isActive
                                            ? 'text-cyan-bright'
                                            : 'text-gray-400'
                                        }
                                    `}
                                >
                                    <Icon size={24} />
                                    <span className="text-xs font-medium">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeMobileNav"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-bright"
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
