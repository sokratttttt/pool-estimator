'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, X, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const COLORS = [
    '#FFD54F', // Желтый
    '#FF8A80', // Розовый
    '#82B1FF', // Голубой
    '#B9F6CA', // Зеленый
    '#FFE57F', // Песочный
];

interface StickyNote {
    id: string;
    author_name: string;
    content: string;
    color: string;
    created_at: string;
}

type StickyNotesProps = object;

export default function StickyNotes({ }: StickyNotesProps) {
    const [notes, setNotes] = useState<StickyNote[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newNote, setNewNote] = useState({ author: '', content: '', color: COLORS[0] });

    useEffect(() => {
        fetchNotes();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('sticky_notes_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sticky_notes'
                },
                () => {
                    fetchNotes();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotes = async () => {
        try {
            const { data, error } = await supabase
                .from('sticky_notes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newNote.author.trim() || !newNote.content.trim()) {
            toast.error('Заполните все поля');
            return;
        }

        try {
            const { error } = await supabase
                .from('sticky_notes')
                .insert({
                    author_name: newNote.author,
                    content: newNote.content,
                    color: newNote.color
                });

            if (error) throw error;

            setNewNote({ author: '', content: '', color: COLORS[0] });
            setShowForm(false);
            toast.success('Заметка добавлена!');
        } catch (error) {
            console.error('Error creating note:', error);
            toast.error('Не удалось создать заметку');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('sticky_notes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Заметка удалена');
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Не удалось удалить заметку');
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <StickyNote className="text-yellow-400" size={24} />
                    <h2 className="text-xl font-bold text-white">Заметки команды</h2>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors shadow-lg"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* New Note Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <input
                                type="text"
                                placeholder="Ваше имя"
                                value={newNote.author}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote({ ...newNote, author: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded mb-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                            />
                            <textarea
                                placeholder="Текст заметки..."
                                value={newNote.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote({ ...newNote, content: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded mb-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewNote({ ...newNote, color })}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform ${newNote.color === color ? 'border-white scale-110' : 'border-gray-600'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium transition-colors"
                                >
                                    Создать
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                    {notes.map((note: StickyNote) => (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            className="relative p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 hover:rotate-1"
                            style={{ backgroundColor: note.color }}
                        >
                            <button
                                onClick={() => handleDelete(note.id)}
                                className="absolute top-2 right-2 p-1 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                            >
                                <X size={16} className="text-gray-800" />
                            </button>
                            <p className="text-sm font-bold text-gray-800 mb-2">{note.author_name}</p>
                            <p className="text-gray-900 whitespace-pre-wrap break-words">{note.content}</p>
                            <p className="text-xs text-gray-600 mt-3">
                                {new Date(note.created_at).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {notes.length === 0 && !showForm && (
                <div className="text-center py-12 text-gray-500">
                    <StickyNote size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Пока нет заметок. Создайте первую!</p>
                </div>
            )}
        </div>
    );
}
