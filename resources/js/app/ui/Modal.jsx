import React, { useEffect } from 'react';

export default function Modal({ title, children, isOpen, onClose, footer }) {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
            <button
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                type="button"
                onClick={onClose}
                aria-label="Close dialog overlay"
            />

            <div
                className="relative z-[91] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(2,6,23,0.55)] dark:border-slate-800 dark:bg-slate-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white/70 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</div>
<button
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <span className="text-xl leading-none">×</span>
                        </button>
                </div>
                <div className="px-5 py-5 text-slate-900 dark:text-slate-100">{children}</div>
                {footer ? (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
