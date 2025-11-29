'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatSidebar from './chat/ChatSidebar';
import ChatWindow from './chat/ChatWindow';

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    if (pathname === '/chat') return null;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow z-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-[800px] h-[600px] bg-white rounded-lg shadow-2xl flex overflow-hidden z-40"
                    >
                        <ChatSidebar />
                        <ChatWindow />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
