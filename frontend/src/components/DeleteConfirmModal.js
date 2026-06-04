// src/components/DeleteConfirmModal.js

import React from 'react';
import './DeleteConfirmModal.css';

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "삭제 확인",
    message = "정말로 삭제하시겠습니까?",
    itemName = "",
    isDeleting = false
}) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose} disabled={isDeleting}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="warning-icon">⚠️</div>
                    <p>{message}</p>
                    {itemName && <p><strong>"{itemName}"</strong></p>}
                    <p className="warning-text">이 작업은 되돌릴 수 없습니다.</p>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-cancel"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        취소
                    </button>
                    <button
                        className="btn btn-delete"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? '삭제 중...' : '삭제'}
                    </button>
                </div>
            </div>
        </div>
    );
}
