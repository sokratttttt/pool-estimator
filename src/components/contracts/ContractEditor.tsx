'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save, Table as TableIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AppleButton from '../apple/AppleButton';
import AppleInput from '../apple/AppleInput';
import { toast } from 'sonner';

interface SortableSectionProps {
    template?: any;
    onSave?: () => void;
    section?: any;
    index?: any;
    onChange?: (index: number, section: any) => void;
    onDelete?: (index: number) => void;
    event?: any;
    newSection?: any;

}

const SortableSection = ({ section, index, onChange, onDelete }: SortableSectionProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `section-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 group">
            <div className="flex items-start gap-4">
                <div {...attributes} {...listeners} className="mt-2 cursor-grab text-slate-500 hover:text-white transition-colors">
                    <GripVertical size={20} />
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        <select
                            value={section.type}
                            onChange={(e: any) => onChange?.(index, { ...section, type: e.target.value })}
                            className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-bright"
                        >
                            <option value="paragraph">Параграф</option>
                            <option value="heading">Заголовок</option>
                            <option value="header">Шапка</option>
                            <option value="signatures_table">Таблица подписей</option>
                        </select>

                        {section.type !== 'signatures_table' && (
                            <select
                                value={section.alignment || 'left'}
                                onChange={(e: any) => onChange?.(index, { ...section, alignment: e.target.value })}
                                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-bright"
                            >
                                <option value="left">Слева</option>
                                <option value="center">По центру</option>
                                <option value="right">Справа</option>
                                <option value="justified">По ширине</option>
                            </select>
                        )}

                        {section.type === 'heading' && (
                            <select
                                value={section.level || 1}
                                onChange={(e: any) => onChange?.(index, { ...section, level: parseInt(e.target.value) })}
                                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-bright"
                            >
                                <option value={1}>H1</option>
                                <option value={2}>H2</option>
                                <option value={3}>H3</option>
                            </select>
                        )}
                    </div>

                    {section.type !== 'signatures_table' && (
                        <textarea
                            value={section.text || ''}
                            onChange={(e: any) => onChange?.(index, { ...section, text: e.target.value })}
                            placeholder="Текст секции..."
                            className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-bright resize-y font-mono text-sm"
                        />
                    )}

                    {section.type === 'signatures_table' && (
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center text-slate-400 text-sm">
                            <TableIcon className="mx-auto mb-2 opacity-50" />
                            Автоматическая таблица с реквизитами сторон
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onDelete?.(index)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

interface ContractEditorProps {
    template?: any;
    onSave?: (data: any) => void;
}

export default function ContractEditor({ template, onSave }: ContractEditorProps) {
    const [sections, setSections] = useState(template?.content?.sections || []);
    const [name, setName] = useState(template?.name || '');
    const [description, setDescription] = useState(template?.description || '');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setSections((items: any) => {
                const oldIndex = parseInt(active.id.split('-')[1]);
                const newIndex = parseInt(over.id.split('-')[1]);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSectionChange = (index: number, newSection: any) => {
        const newSections = [...sections];
        newSections[index] = newSection;
        setSections(newSections);
    };

    const handleDeleteSection = (index: number) => {
        setSections(sections.filter((_: any, i: number) => i !== index));
    };

    const handleAddSection = () => {
        setSections([...sections, { type: 'paragraph', text: '', alignment: 'left' }]);
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Введите название шаблона');
            return;
        }
        if (onSave) {
            onSave({
                name,
                description,
                content: { sections }
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AppleInput
                    label="Название шаблона"
                    value={name}
                    onChange={(e: React.ChangeEvent<any>) => setName(e.target.value)}
                />
                <AppleInput
                    label="Описание"
                    value={description}
                    onChange={(e: React.ChangeEvent<any>) => setDescription(e.target.value)}
                />
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Структура документа</h3>
                    <div className="flex gap-2">
                        <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">
                            Переменные: {'{{CLIENT_NAME}}'}, {'{{TOTAL_SUM}}'}, {'{{DATE}}'}, {'{{CONTRACT_NUMBER}}'}
                        </span>
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sections.map((_: any, i: number) => `section-${i}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        {sections.map((section: any, index: number) => (
                            <SortableSection
                                key={`section-${index}`}
                                index={index}
                                section={section}
                                onChange={handleSectionChange}
                                onDelete={() => handleDeleteSection(index)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <button
                    onClick={handleAddSection}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-cyan-bright/50 hover:bg-cyan-bright/5 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Добавить секцию
                </button>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
                <AppleButton
                    variant="primary"
                    onClick={handleSave}
                    icon={<Save size={20} />}
                >
                    Сохранить шаблон
                </AppleButton>
            </div>
        </div>
    );
}
