/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Loader2, Calendar, Eye, EyeOff, Download, Edit, Copy, Trash2, CheckCircle, XCircle, FileText, User, Building, Phone, Mail, Globe, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { HistoryEstimate as Estimate, EstimateStatus, Customer } from '@/types';
import { formatCurrency } from '@/utils/formatting';
import { updateEstimate } from '@/services/estimates';
import { useEstimatesQuery, useDeleteEstimate } from '@/hooks/queries/useEstimatesQuery';
import { toast } from 'sonner';
// import { useAuth } from '@/context/AuthContext'; // Закомментировано - проверь существует ли файл
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import VirtualizedList from '@/components/VirtualizedList';

// Заглушка для AuthContext если файла нет
const useAuth = () => ({
    user: { id: '1', name: 'Пользователь', email: 'user@example.com' }
});

// Базовые компоненты UI
interface BaseProps {
    children?: React.ReactNode;
    className?: string;
    [key: string]: unknown;
}

const Card = ({ children, className = '' }: BaseProps) => (
    <div className={`border rounded-lg bg-white ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }: BaseProps) => (
    <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }: BaseProps) => (
    <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: BaseProps) => (
    <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'destructive';
    size?: 'default' | 'sm' | 'icon';
}

const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }: ButtonProps) => {
    const variants: Record<string, string> = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        destructive: 'bg-red-600 text-white hover:bg-red-700'
    };
    const sizes: Record<string, string> = {
        default: 'px-4 py-2 text-sm',
        sm: 'px-3 py-1 text-xs',
        icon: 'p-2'
    };
    return (
        <button
            className={`rounded-md font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

const Badge = ({ children, className = '' }: BaseProps) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
        {children}
    </span>
);

const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`} {...props} />
);

interface LabelProps {
    children: React.ReactNode;
    htmlFor?: string;
}

const Label = ({ children, htmlFor }: LabelProps) => (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
        {children}
    </label>
);

interface SelectProps {
    value?: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}

const Select = ({ value, onValueChange, children }: SelectProps) => (
    <select
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
    >
        {children}
    </select>
);

interface DialogProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
            <div className="relative z-50 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
                {children}
            </div>
        </div>
    );
};

const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6 pb-0">{children}</div>;
const DialogTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold">{children}</h3>;
const DialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-gray-500">{children}</p>;

const Textarea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`} {...props} />
);

const Separator = () => <div className="h-px bg-gray-200" />;
interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

const Switch = ({ checked, onCheckedChange }: SwitchProps) => (
    <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
        onClick={() => onCheckedChange(!checked)}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

// Константы
// Константы
// const ITEMS_PER_PAGE = 10; // Удалено в пользу виртуализации
const STATUS_CONFIG: Record<EstimateStatus, { color: string; icon: React.ElementType; text: string }> = {
    draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, text: 'Черновик' },
    sent: { color: 'bg-blue-100 text-blue-800', icon: Mail, text: 'Отправлено' },
    viewed: { color: 'bg-purple-100 text-purple-800', icon: Eye, text: 'Просмотрено' },
    accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Принято' },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Отклонено' }
};

interface EstimateRowProps {
    estimate: Estimate;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onEdit: (estimate: Estimate) => void;
    onDuplicate: () => void;
    onDelete: (id: string) => void;
}

const EstimateRow = ({ estimate, isExpanded, onToggleExpand, onEdit, onDuplicate, onDelete }: EstimateRowProps) => {
    const statusConfig = STATUS_CONFIG[estimate.status as keyof typeof STATUS_CONFIG];
    const IconComponent = statusConfig?.icon as React.ComponentType<{ className?: string }> | undefined;
    const items = estimate.items || estimate.selection?.items || [];

    return (
        <Card>
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{estimate.title}</h3>
                                <Badge className={statusConfig?.color || ''}>
                                    <span className="flex items-center gap-1">
                                        {IconComponent && <IconComponent className="w-4 h-4" />}
                                        {statusConfig?.text || estimate.status}
                                    </span>
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                                ID: {estimate.id} • Клиент: {estimate.customer?.name || 'Не указан'}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                                <p className="flex items-center">
                                    <Calendar size={12} className="inline mr-1" />
                                    {format(new Date(estimate.createdAt), 'dd MMMM yyyy', { locale: ru })}
                                </p>
                                <p>Позиций: {items.length}</p>
                                <p className="font-semibold">Итого: {formatCurrency(estimate.total || 0)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => onToggleExpand(estimate.id)}>
                                {isExpanded ? <><EyeOff className="w-4 h-4 mr-2" />Свернуть</> : <><Eye className="w-4 h-4 mr-2" />Подробнее</>}
                            </Button>
                            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />PDF</Button>
                            <Button variant="outline" size="sm" onClick={() => onEdit(estimate)}>
                                <Edit className="w-4 h-4 mr-2" />Изменить
                            </Button>
                            <Button variant="outline" size="sm" onClick={onDuplicate}>
                                <Copy className="w-4 h-4 mr-2" />Копия
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => onDelete(estimate.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />Удалить
                            </Button>
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="mt-6 pt-6 border-t">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Позиции</h4>
                                    <div className="border rounded">
                                        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                                            <div className="col-span-6">Наименование</div>
                                            <div className="col-span-2">Количество</div>
                                            <div className="col-span-2">Цена</div>
                                            <div className="col-span-2">Сумма</div>
                                        </div>
                                        {items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0">
                                                <div className="col-span-6">{item.name}</div>
                                                <div className="col-span-2">{item.quantity} {item.unit}</div>
                                                <div className="col-span-2">{formatCurrency(item.price)}</div>
                                                <div className="col-span-2 font-medium">{formatCurrency(item.quantity * item.price)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {estimate.customer && (
                                    <div>
                                        <h4 className="font-medium mb-2">Клиент</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" /><span className="font-medium">Имя:</span>{estimate.customer.name}</div>
                                                {estimate.customer.company && <div className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-500" /><span className="font-medium">Компания:</span>{estimate.customer.company}</div>}
                                                {estimate.customer.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><span className="font-medium">Телефон:</span>{estimate.customer.phone}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                {estimate.customer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /><span className="font-medium">Email:</span>{estimate.customer.email}</div>}
                                                {estimate.customer.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-500" /><span className="font-medium">Сайт:</span>{estimate.customer.website}</div>}
                                                {estimate.customer.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /><span className="font-medium">Адрес:</span>{estimate.customer.address}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {estimate.notes && (
                                    <div>
                                        <h4 className="font-medium mb-2">Примечания</h4>
                                        <div className="border rounded p-4">
                                            <p className="whitespace-pre-wrap">{estimate.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function HistoryPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    // const [currentPage, setCurrentPage] = useState(1); // Удалено в пользу виртуализации
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [estimateToDelete, setEstimateToDelete] = useState<string | null>(null);
    const [expandedEstimates, setExpandedEstimates] = useState<Set<string>>(new Set());
    const [showOnlyMy, setShowOnlyMy] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'total' | 'name'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [editForm, setEditForm] = useState<Partial<Estimate>>({});
    const [editCustomer, setEditCustomer] = useState<Partial<Customer>>({});

    // React Query для загрузки данных с кешированием
    const {
        data: estimates = [],
        isLoading: loading,
        refetch: loadEstimates
    } = useEstimatesQuery({
        status: statusFilter as EstimateStatus | 'all',
        search: searchTerm,
        sortBy,
        sortOrder
    });

    // React Query mutation для удаления
    const deleteEstimateMutation = useDeleteEstimate();

    // Фильтрация и сортировка
    const filteredEstimates = useMemo(() => {
        let filtered = [...estimates];

        // Поиск
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(estimate =>
                estimate.title?.toLowerCase().includes(term) ||
                estimate.customer?.name?.toLowerCase().includes(term) ||
                estimate.customer?.email?.toLowerCase().includes(term) ||
                estimate.customer?.phone?.toLowerCase().includes(term) ||
                estimate.id.toLowerCase().includes(term)
            );
        }

        // Фильтр по статусу
        if (statusFilter !== 'all') {
            filtered = filtered.filter(estimate => estimate.status === statusFilter);
        }

        // Фильтр по дате
        if (dateFilter !== 'all') {
            const now = new Date();
            const cutoffDate = new Date();

            switch (dateFilter) {
                case 'week': cutoffDate.setDate(now.getDate() - 7); break;
                case 'month': cutoffDate.setDate(now.getDate() - 30); break;
                case 'quarter': cutoffDate.setDate(now.getDate() - 90); break;
            }

            filtered = filtered.filter(estimate => new Date(estimate.createdAt) >= cutoffDate);
        }

        // Только мои сметы
        if (showOnlyMy && user) {
            filtered = filtered.filter(estimate => estimate.userId === user.id);
        }

        // Сортировка
        filtered.sort((a, b) => {
            let aValue: number | string = 0, bValue: number | string = 0;

            switch (sortBy) {
                case 'date': aValue = new Date(a.createdAt).getTime(); bValue = new Date(b.createdAt).getTime(); break;
                case 'total': aValue = a.total || 0; bValue = b.total || 0; break;
                case 'name': aValue = a.title || ''; bValue = b.title || ''; break;
            }

            return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });

        return filtered;
    }, [estimates, searchTerm, statusFilter, dateFilter, showOnlyMy, sortBy, sortOrder, user]);

    // Пагинация удалена в пользу виртуализации
    /* const totalPages = Math.ceil(filteredEstimates.length / ITEMS_PER_PAGE);
    const paginatedEstimates = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEstimates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEstimates, currentPage]); */

    // Обработчики
    const toggleEstimateExpand = useCallback((id: string) => {
        setExpandedEstimates(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    }, []);

    const handleDeleteClick = useCallback((id: string) => {
        setEstimateToDelete(id);
        setIsDeleteConfirmOpen(true);
    }, []);

    const confirmDelete = async () => {
        if (!estimateToDelete) return;

        try {
            await deleteEstimateMutation.mutateAsync(estimateToDelete);
            // Данные автоматически обновятся через React Query
        } catch (_error) {
            // Ошибка уже обработана в mutation
        } finally {
            setIsDeleteConfirmOpen(false);
            setEstimateToDelete(null);
        }
    };

    const handleEditClick = useCallback((estimate: Estimate) => {
        setSelectedEstimate(estimate);
        setEditForm({ title: estimate.title, status: estimate.status, notes: estimate.notes });
        setEditCustomer(estimate.customer || {});
        setIsEditOpen(true);
    }, []);

    const saveEdit = async () => {
        if (!selectedEstimate) return;

        try {
            await updateEstimate(selectedEstimate.id, {
                ...editForm,
                customer: editCustomer
            });
            // Перезагружаем данные через React Query
            await loadEstimates();
            setIsEditOpen(false);
            toast.success('Смета успешно обновлена');
        } catch (_error) {
            toast.error('Не удалось обновить смету');
        }
    };

    const duplicateEstimate = async () => {
        toast.success('Смета скопирована');
    };

    // EstimateRow перемещен за пределы компонента

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">История смет</h1>
                    <p className="text-gray-500">Всего смет: {estimates.length} • Отфильтровано: {filteredEstimates.length}</p>
                </div>
                <Button onClick={() => loadEstimates()} variant="outline">
                    <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Обновить
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Фильтры и поиск</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Поиск</Label>
                            <Input id="search" placeholder="Название, клиент, ID..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Статус</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <option value="all">Все статусы</option>
                                <option value="draft">Черновик</option>
                                <option value="sent">Отправлено</option>
                                <option value="viewed">Просмотрено</option>
                                <option value="accepted">Принято</option>
                                <option value="rejected">Отклонено</option>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Дата создания</Label>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <option value="all">За все время</option>
                                <option value="week">За неделю</option>
                                <option value="month">За месяц</option>
                                <option value="quarter">За квартал</option>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sort">Сортировка</Label>
                            <div className="flex gap-2">
                                <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'date' | 'total' | 'name')}>
                                    <option value="date">Дате</option>
                                    <option value="total">Сумме</option>
                                    <option value="name">Названию</option>
                                </Select>
                                <Button variant="outline" size="icon" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                                    {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch checked={showOnlyMy} onCheckedChange={setShowOnlyMy} />
                        <Label htmlFor="show-only-my">Показывать только мои сметы</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 h-[calc(100vh-300px)] min-h-[400px]">
                {filteredEstimates.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Сметы не найдены</h3>
                            <p className="text-gray-500 text-center">Попробуйте изменить параметры поиска</p>
                        </CardContent>
                    </Card>
                ) : (
                    <VirtualizedList
                        items={filteredEstimates}
                        renderItem={(estimate) => (
                            <div className="pb-4">
                                <EstimateRow
                                    key={estimate.id}
                                    estimate={estimate}
                                    isExpanded={expandedEstimates.has(estimate.id)}
                                    onToggleExpand={toggleEstimateExpand}
                                    onEdit={handleEditClick}
                                    onDuplicate={duplicateEstimate}
                                    onDelete={handleDeleteClick}
                                />
                            </div>
                        )}
                        itemHeight={180}
                        className="h-full pr-2"
                    />
                )}
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <div className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Редактировать смету</DialogTitle>
                        <DialogDescription>Внесите изменения в смету и информацию о клиенте</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 p-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">Основная информация</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-title">Название сметы</Label>
                                    <Input id="edit-title" value={editForm.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Статус</Label>
                                    <Select value={editForm.status} onValueChange={(value: string) => setEditForm({ ...editForm, status: value as EstimateStatus })}>
                                        <option value="draft">Черновик</option>
                                        <option value="sent">Отправлено</option>
                                        <option value="viewed">Просмотрено</option>
                                        <option value="accepted">Принято</option>
                                        <option value="rejected">Отклонено</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-notes">Примечания</Label>
                                <Textarea id="edit-notes" value={editForm.notes || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-medium">Информация о клиенте</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer-name">Имя</Label>
                                    <Input id="customer-name" value={editCustomer.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCustomer({ ...editCustomer, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer-company">Компания</Label>
                                    <Input id="customer-company" value={editCustomer.company || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCustomer({ ...editCustomer, company: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer-phone">Телефон</Label>
                                    <Input id="customer-phone" value={editCustomer.phone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCustomer({ ...editCustomer, phone: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer-email">Email</Label>
                                    <Input id="customer-email" type="email" value={editCustomer.email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCustomer({ ...editCustomer, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer-website">Сайт</Label>
                                    <Input id="customer-website" value={editCustomer.website || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCustomer({ ...editCustomer, website: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer-address">Адрес</Label>
                                    <Input id="customer-address" value={editCustomer.address || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCustomer({ ...editCustomer, address: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t">
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Отмена</Button>
                        <Button onClick={saveEdit}>Сохранить изменения</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle>Подтверждение удаления</DialogTitle>
                        <DialogDescription>Вы уверены, что хотите удалить эту смету? Это действие нельзя отменить.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Отмена</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Удалить</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}