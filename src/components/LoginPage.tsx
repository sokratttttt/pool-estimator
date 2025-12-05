'use client';
import { useState } from 'react';
import { useSync } from '@/context/SyncContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn, Loader2 } from 'lucide-react';
import AppleCard from './apple/AppleCard';

interface LoginPageProps {
    onSuccess?: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useSync();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/calculator');
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-apple-bg-primary flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                    >
                        <Lock size={40} className="text-white" />
                    </motion.div>

                    <h1 className="apple-heading-1 mb-2">MOS-POOL</h1>
                    <p className="apple-body-secondary">Калькулятор смет</p>
                </div>

                <AppleCard>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="apple-body font-medium mb-2 block">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-secondary" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-apple-border bg-apple-bg-secondary text-gray-900 focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="apple-body font-medium mb-2 block">
                                Пароль
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-secondary" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-apple-border bg-apple-bg-secondary text-gray-900 focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 rounded-xl bg-apple-primary text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Вход...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Войти</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-apple-border">
                        <p className="apple-caption text-center text-apple-text-secondary">
                            Используйте учетные данные, выданные администратором
                        </p>
                    </div>
                </AppleCard>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <p className="apple-caption text-apple-text-secondary">
                        © 2025 MOS-POOL. Все права защищены.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
