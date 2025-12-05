'use client';

import React, { ReactNode } from 'react';

export interface ProCardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    footer?: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const ProCard: React.FC<ProCardProps> = ({
    children,
    title,
    subtitle,
    actions,
    footer,
    className = '',
    noPadding = false
}) => {
    return (
        <div className={`pro-card ${className}`}>
            {(title || actions) && (
                <div className="pro-card-header">
                    <div>
                        {title && <h3 className="pro-card-title">{title}</h3>}
                        {subtitle && <p className="pro-text-tertiary pro-text-sm">{subtitle}</p>}
                    </div>
                    {actions && <div className="pro-card-actions">{actions}</div>}
                </div>
            )}

            <div className={noPadding ? '' : 'pro-card-body'}>
                {children}
            </div>

            {footer && (
                <div className="pro-card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default ProCard;
