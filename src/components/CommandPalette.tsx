'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Calculator, History, Package, MessageSquare, FileText, Plus, Save, Download, Settings, Palette, ClipboardList, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSelector from './ThemeSelector';
import { useRequests } from '@/context/RequestsContext';
import { useClients } from '@/context/ClientContext';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CommandPaletteProps {
    // No props needed currently
}

export default function CommandPalette({ }: CommandPaletteProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { requests, fetchRequests } = useRequests();
    const { clients, loadClients } = useClients();
    const [showThemeSelector, setShowThemeSelector] = useState(false);

    // Toggle on Ctrl+K or Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open: boolean) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Fetch data when palette opens
    useEffect(() => {
        if (open) {
            fetchRequests();
            loadClients();
        }
    }, [open, fetchRequests, loadClients]);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Command Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
                    >
                        <Command className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                            <div className="flex items-center border-b border-gray-200 px-4">
                                <Search className="mr-2 h-5 w-5 shrink-0 text-gray-400" />
                                <Command.Input
                                    placeholder="Поиск по приложению..."
                                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-gray-400"
                                />
                                <kbd className="ml-2 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 font-mono text-xs text-gray-600">
                                    Esc
                                </kbd>
                            </div>

                            <Command.List className="max-h-[400px] overflow-y-auto p-2">
                                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                                    Ничего не найдено
                                </Command.Empty>

                                {/* Navigation */}
                                <Command.Group heading="Навигация" className="px-2 py-2 text-xs font-semibold text-gray-500">
                                    <CommandItem
                                        icon={<Calculator className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => router.push('/'))}
                                    >
                                        Калькулятор
                                    </CommandItem>
                                    <CommandItem
                                        icon={<History className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => router.push('/history'))}
                                    >
                                        История смет
                                    </CommandItem>
                                    <CommandItem
                                        icon={<Package className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => router.push('/catalog'))}
                                    >
                                        Каталог оборудования
                                    </CommandItem>
                                    <CommandItem
                                        icon={<MessageSquare className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => router.push('/chat'))}
                                    >
                                        Чат
                                    </CommandItem>
                                    <CommandItem
                                        icon={<ClipboardList className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => router.push('/requests'))}
                                    >
                                        Заявки
                                    </CommandItem>
                                    <CommandItem
                                        icon={<Users className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => router.push('/clients'))}
                                    >
                                        Клиенты
                                    </CommandItem>
                                    <CommandItem
                                        icon={<Settings className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => router.push('/settings'))}
                                    >
                                        Настройки
                                    </CommandItem>
                                    <CommandItem
                                        icon={<Palette className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => setShowThemeSelector(true))}
                                    >
                                        Сменить тему
                                    </CommandItem>
                                </Command.Group>

                                {/* Professional Actions */}
                                <Command.Group heading="Профессиональные инструменты" className="px-2 py-2 text-xs font-semibold text-gray-500">
                                    <CommandItem
                                        icon={<Download className="w-4 h-4" />}
                                        shortcut="Ctrl+E"
                                        onSelect={() => runCommand(() => {
                                            window.dispatchEvent(new CustomEvent('export-excel'));
                                        })}
                                    >
                                        Экспорт в Excel
                                    </CommandItem>
                                    <CommandItem
                                        icon={<FileText className="w-4 h-4" />}
                                        shortcut="Ctrl+P"
                                        onSelect={() => runCommand(() => {
                                            window.dispatchEvent(new CustomEvent('export-pdf'));
                                        })}
                                    >
                                        Экспорт в PDF
                                    </CommandItem>
                                    <CommandItem
                                        icon={<Plus className="w-4 h-4" />}
                                        shortcut="Ctrl+N"
                                        onSelect={() => runCommand(() => {
                                            localStorage.removeItem('mos-pool-current-estimate');
                                            router.push('/calculator');
                                        })}
                                    >
                                        Новая смета
                                    </CommandItem>
                                    <CommandItem
                                        icon={<Save className="w-4 h-4" />}
                                        shortcut="Ctrl+S"
                                        onSelect={() => runCommand(() => {
                                            window.dispatchEvent(new CustomEvent('save-estimate'));
                                        })}
                                    >
                                        Сохранить смету
                                    </CommandItem>
                                    <CommandItem
                                        icon={<FileText className="w-4 h-4" />}
                                        shortcut="Ctrl+T"
                                        onSelect={() => runCommand(() => {
                                            window.dispatchEvent(new CustomEvent('show-template-selector'));
                                        })}
                                    >
                                        Шаблоны бассейнов
                                    </CommandItem>
                                </Command.Group>

                                {/* Requests Search */}
                                {requests && requests.length > 0 && (
                                    <Command.Group heading="Заявки" className="px-2 py-2 text-xs font-semibold text-gray-500">
                                        {requests.slice(0, 5).map((request: { id: string; client_name: string; phone?: string }) => (
                                            <CommandItem
                                                key={request.id}
                                                icon={<ClipboardList className="w-4 h-4" />}
                                                onSelect={() => runCommand(() => router.push('/requests'))}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{request.client_name}</span>
                                                    <span className="text-xs text-gray-400">{request.phone}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </Command.Group>
                                )}

                                {/* Clients Search */}
                                {clients && clients.length > 0 && (
                                    <Command.Group heading="Клиенты" className="px-2 py-2 text-xs font-semibold text-gray-500">
                                        {clients.slice(0, 5).map((client: { id: string; name: string; phone?: string }) => (
                                            <CommandItem
                                                key={client.id}
                                                icon={<Users className="w-4 h-4" />}
                                                onSelect={() => runCommand(() => router.push('/clients'))}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{client.name}</span>
                                                    <span className="text-xs text-gray-400">{client.phone}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </Command.Group>
                                )}

                                {/* Actions */}
                                <Command.Group heading="Действия" className="px-2 py-2 text-xs font-semibold text-gray-500">
                                    <CommandItem
                                        icon={<Plus className="w-4 h-4" />}
                                        shortcut="Ctrl+N"
                                        onSelect={() => runCommand(() => {
                                            localStorage.removeItem('mos-pool-current-estimate');
                                            router.push('/');
                                            window.location.reload();
                                        })}
                                    >
                                        Новая смета
                                    </CommandItem>
                                    <CommandItem
                                        icon={<Save className="w-4 h-4" />}
                                        shortcut="Ctrl+S"
                                        onSelect={() => runCommand(() => {
                                            const event = new CustomEvent('save-estimate');
                                            window.dispatchEvent(event);
                                        })}
                                    >
                                        Сохранить смету
                                    </CommandItem>
                                    <CommandItem
                                        icon={<Download className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => {
                                            const event = new CustomEvent('export-pdf');
                                            window.dispatchEvent(event);
                                        })}
                                    >
                                        Экспортировать в PDF
                                    </CommandItem>
                                    <CommandItem
                                        icon={<FileText className="w-4 h-4" />}
                                        onSelect={() => runCommand(() => {
                                            const event = new CustomEvent('export-excel');
                                            window.dispatchEvent(event);
                                        })}
                                    >
                                        Экспортировать в Excel
                                    </CommandItem>
                                </Command.Group>
                            </Command.List>

                            {/* Footer */}
                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↑↓</kbd> для навигации
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">Enter</kbd> выбрать
                                    </span>
                                </div>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">Ctrl</kbd>
                                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">K</kbd> открыть
                                </span>
                            </div>
                        </Command>
                    </motion.div>

                    {/* Theme Selector Modal */}
                    <AnimatePresence>
                        {showThemeSelector && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowThemeSelector(false)}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative bg-apple-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-apple-border z-10"
                                >
                                    <ThemeSelector onClose={() => setShowThemeSelector(false)} />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}

interface CommandItemProps {
    icon: React.ReactNode;
    children: React.ReactNode;
    shortcut?: string;
    onSelect: () => void;
}

function CommandItem({ icon, children, shortcut, onSelect }: CommandItemProps) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-blue-50 aria-selected:bg-blue-50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="text-gray-500">{icon}</div>
                <span className="text-gray-800">{children}</span>
            </div>
            {shortcut && (
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-2 font-mono text-xs text-gray-600">
                    {shortcut}
                </kbd>
            )}
        </Command.Item>
    );
}
