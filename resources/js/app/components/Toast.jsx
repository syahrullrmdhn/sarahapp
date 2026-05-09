import { useEffect } from 'react';
import clsx from 'clsx';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={clsx(
            'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slide-up',
            type === 'success' && 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
            type === 'error' && 'bg-red-50 border-red-200 dark:bg-red-900/40 dark:border-red-800 text-red-800 dark:text-red-200',
            type === 'info' && 'bg-blue-50 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        )}>
            {type === 'success' && (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            )}
            {type === 'error' && (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            {type === 'info' && (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 p-1 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}