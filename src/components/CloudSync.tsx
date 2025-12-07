'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useEstimate } from '@/context/EstimateContext';
import { Cloud, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CloudSyncProps { }

export default function CloudSync({ }: CloudSyncProps) {
    const { selection } = useEstimate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isLoginView, setIsLoginView] = useState(false);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            toast.error('❌ Ошибка входа', {
                description: error.message,
                duration: 5000,
            });
        } else {
            toast.success('✉️ Проверьте почту!', {
                description: `Ссылка для входа отправлена на ${email}`,
                duration: 5000,
            });
            setIsLoginView(false);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('👋 До встречи!', {
            description: 'Вы вышли из системы',
            duration: 3000,
        });
    };

    const handleSync = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Save current estimate
            const { error: saveError } = await supabase
                .from('estimates')
                .upsert({
                    user_id: user.id,
                    name: `Смета от ${new Date().toLocaleDateString()}`,
                    data: selection,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' }); // Simple logic: 1 user = 1 active estimate for now

            if (saveError) throw saveError;

            toast.success('☁️ Смета сохранена в облаке', {
                description: 'Доступна на всех ваших устройствах',
                duration: 3000,
            });
        } catch (error) {
            toast.error('❌ Ошибка синхронизации', {
                description: (error instanceof Error ? error.message : 'Unknown error'),
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        if (isLoginView) {
            return (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Вход в облако</h3>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Ваша почта"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Отправка...' : 'Получить ссылку'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsLoginView(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        return (
            <button
                onClick={() => setIsLoginView(true)}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm"
            >
                <LogIn size={16} />
                <span className="hidden md:inline">Войти</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleSync}
                disabled={loading}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                title="Сохранить в облако"
            >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Cloud size={16} />}
                <span className="hidden md:inline">Синхронизация</span>
            </button>
            <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                title="Выйти"
            >
                <LogOut size={16} />
            </button>
        </div>
    );
}
