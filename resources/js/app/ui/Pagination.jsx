import React from 'react';

export default function Pagination({ meta, onPageChange }) {
    if (!meta || !meta.last_page || meta.last_page <= 1) {
        return null;
    }

    const from = meta.from ?? 0;
    const to = meta.to ?? 0;
    const total = meta.total ?? 0;
    const current = meta.current_page ?? 1;
    const last = meta.last_page ?? 1;

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing {from}-{to} of {total}
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800"
                    type="button"
                    disabled={current <= 1}
                    onClick={() => onPageChange(current - 1)}
                >
                    Prev
                </button>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Page {current} / {last}
                </div>
                <button
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800"
                    type="button"
                    disabled={current >= last}
                    onClick={() => onPageChange(current + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
