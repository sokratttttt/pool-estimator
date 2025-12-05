'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import ContractEditor from '@/components/contracts/ContractEditor';
import AppleButton from '@/components/apple/AppleButton';
import { toast } from 'sonner';


export default function ContractsSettingsPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const { data, error } = await supabase
                .from('contract_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Ошибка загрузки шаблонов');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (templateData: any) => {
        try {
            if (editingTemplate) {
                const { error } = await supabase
                    .from('contract_templates')
                    .update(templateData)
                    .eq('id', editingTemplate.id);
                if (error) throw error;
                toast.success('Шаблон обновлен');
            } else {
                const { error } = await supabase
                    .from('contract_templates')
                    .insert([templateData]);
                if (error) throw error;
                toast.success('Шаблон создан');
            }

            setEditingTemplate(null);
            setIsCreating(false);
            fetchTemplates();
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Ошибка сохранения');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-navy-deep">
                <Loader2 className="w-8 h-8 text-cyan-bright animate-spin" />
            </div>
        );
    }

    if (editingTemplate || isCreating) {
        return (
            <div className="min-h-screen bg-navy-deep p-8">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => {
                            setEditingTemplate(null);
                            setIsCreating(false);
                        }}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Назад к списку
                    </button>

                    <h1 className="text-3xl font-bold text-white mb-8">
                        {isCreating ? 'Создание шаблона' : 'Редактирование шаблона'}
                    </h1>

                    <ContractEditor
                        template={editingTemplate}
                        onSave={handleSave}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-deep p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Шаблоны договоров</h1>
                        <p className="text-slate-400">Управление шаблонами для автогенерации документов</p>
                    </div>
                    <AppleButton
                        variant="primary"
                        onClick={() => setIsCreating(true)}
                        icon={<Plus size={20} />}
                    >
                        Новый шаблон
                    </AppleButton>
                </div>

                <div className="grid gap-4">
                    {templates.map((template: any) => (
                        <div
                            key={template.id}
                            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
                            onClick={() => setEditingTemplate(template)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-cyan-bright/10 flex items-center justify-center text-cyan-bright">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-bright transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-slate-400 text-sm">
                                            {template.description || 'Нет описания'}
                                        </p>
                                    </div>
                                </div>
                                {template.is_default && (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/20">
                                        По умолчанию
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {templates.length === 0 && (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10 border-dashed">
                            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Нет созданных шаблонов</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
