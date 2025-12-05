import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Search } from 'lucide-react';
import { forwardRef } from 'react';

/**
 * Search input component with icon
 */
interface SearchInputProps extends Omit<HTMLMotionProps<"input">, "onSubmit"> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit?: (value: string) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
    value,
    onChange,
    onSubmit,
    placeholder = 'Поиск...',
    className = '',
    ...props
}, ref) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(value);
    };

    return (
        <form onSubmit={handleSubmit} className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <Search size={20} />
                </div>
                <motion.input
                    ref={ref}
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    whileFocus={{ scale: 1.01 }}
                    className="
                        w-full pl-12 pr-4 py-3
                        bg-white/5 border border-white/10
                        rounded-lg
                        text-white placeholder-white/40
                        transition-all duration-200
                        focus:outline-none focus:border-cyan-500 focus:bg-white/10
                        focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep
                    "
                    {...props}
                />
            </div>
        </form>
    );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
