// Utility Types - Centralized type definitions for utility functions

// ============================================
// STRING UTILITIES
// ============================================

export type CharsetType = 'alphanumeric' | 'alpha' | 'numeric' | 'hex';

export interface CyrillicMap {
    [key: string]: string;
}

// ============================================
// DATE UTILITIES
// ============================================

export type DateInput = Date | string | number;
export type DateFormat = 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'iso' | 'human' | 'short' | 'full' | 'relative';

export interface DateRangeInput {
    start: DateInput;
    end: DateInput;
}

// ============================================
// FORMATTER UTILITIES
// ============================================

export interface FormatOptions {
    locale?: string;
    timeZone?: string;
    precision?: number;
    prefix?: string;
    suffix?: string;
}

export interface AddressData {
    city?: string;
    street?: string;
    building?: string;
    apartment?: string;
}

// ============================================
// URL UTILITIES
// ============================================

export type QueryParamValue = string | number | boolean | null | undefined;

export interface QueryParams {
    [key: string]: QueryParamValue;
}

// ============================================
// COMPONENT UTILITIES
// ============================================

import type { ReactNode, CSSProperties, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

export type ButtonVariant =
    | 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
    | 'info' | 'light' | 'dark' | 'link' | 'outline';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type InputSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface BaseComponentProps {
    className?: string;
    style?: CSSProperties;
    'data-testid'?: string;
    'aria-label'?: string;
    children?: ReactNode;
}

export interface ButtonProps extends BaseComponentProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

export interface InputProps extends BaseComponentProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style' | 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    size?: InputSize;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export interface CardProps extends BaseComponentProps {
    title?: string;
    subtitle?: string;
    header?: ReactNode;
    footer?: ReactNode;
    hoverable?: boolean;
    bordered?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface BadgeProps extends BaseComponentProps {
    variant?: BadgeVariant;
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean;
    dot?: boolean;
}

export interface ModalProps extends BaseComponentProps {
    isOpen?: boolean;
    onClose?: () => void;
    title?: string;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
}

export interface AlertProps extends BaseComponentProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message?: string;
    onClose?: () => void;
    autoClose?: boolean;
    autoCloseDuration?: number;
    action?: ReactNode;
}

export interface TabItem {
    id: string;
    label: string;
    content?: ReactNode;
    disabled?: boolean;
    icon?: ReactNode;
}

export interface TabsProps extends BaseComponentProps {
    items: TabItem[];
    activeTab?: string;
    onChange?: (tabId: string) => void;
    variant?: 'default' | 'pills' | 'underline';
}

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    group?: string;
}

export interface SelectProps extends BaseComponentProps {
    options: SelectOption[];
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    multiple?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    loading?: boolean;
    error?: string;
}

export interface TooltipProps extends BaseComponentProps {
    content: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    trigger?: 'hover' | 'click' | 'focus';
}

export interface SpinnerProps extends BaseComponentProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export interface ProgressBarProps extends BaseComponentProps {
    value: number;
    max?: number;
    showLabel?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    striped?: boolean;
    animated?: boolean;
}
