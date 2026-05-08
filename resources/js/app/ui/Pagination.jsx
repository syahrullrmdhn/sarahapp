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
        <div className="cartel-pagination">
            <div className="cartel-pagination-info">
                Showing {from}-{to} of {total}
            </div>
            <div className="cartel-pagination-controls">
                <button className="cartel-btn" type="button" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>
                    Prev
                </button>
                <div className="cartel-pagination-page">
                    Page {current} / {last}
                </div>
                <button className="cartel-btn" type="button" disabled={current >= last} onClick={() => onPageChange(current + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

