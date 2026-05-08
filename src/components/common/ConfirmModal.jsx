import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Xác nhận", 
    message = "Bạn có chắc chắn muốn thực hiện hành động này không?",
    confirmText = "Xác nhận",
    cancelText = "Hủy bỏ",
    type = "danger" // danger | primary
}) => {
    if (!isOpen) return null;

    const accentColor = type === 'danger' ? '#dc2626' : '#2563eb';
    const bgColor = type === 'danger' ? '#fee2e2' : '#dbeafe';

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', padding: '1rem'
        }}>
            <div style={{
                backgroundColor: '#fff', padding: '30px', borderRadius: '16px',
                width: '100%', maxWidth: '400px', textAlign: 'center', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                position: 'relative', animation: 'modalSlideUp 0.3s ease-out'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', backgroundColor: bgColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                }}>
                    <AlertCircle size={30} color={accentColor} />
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px', color: '#111827' }}>
                    {title}
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '30px', lineHeight: '1.5' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb',
                            backgroundColor: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                            backgroundColor: accentColor, color: '#fff', fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default ConfirmModal;
