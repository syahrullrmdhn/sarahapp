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
        <div className="cartel-modal-backdrop" role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
            <div className="cartel-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cartel-modal-head">
                    <div className="cartel-modal-title">{title}</div>
                    <button type="button" className="cartel-modal-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="cartel-modal-body">{children}</div>
                {footer ? <div className="cartel-modal-foot">{footer}</div> : null}
            </div>
            <button type="button" className="cartel-modal-overlay-btn" onClick={onClose} aria-label="Close dialog overlay" />
        </div>
    );
}

