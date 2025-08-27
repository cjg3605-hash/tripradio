'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface PopupNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const PopupNotification: React.FC<PopupNotificationProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '예',
  cancelText = '아니요',
  autoClose = false,
  autoCloseDelay = 1000
}) => {
  // 자동 닫기 처리
  useEffect(() => {
    if (isOpen && autoClose && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, autoClose, autoCloseDelay, onClose, type]);

  // ESC 키 처리
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const popup = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleBackdropClick}
    >
      {/* 팝업 컨테이너 */}
      <div 
        className="relative bg-white rounded-lg shadow-2xl border border-black/10 mx-4 max-w-sm w-full"
        style={{
          animation: isOpen ? 'popupSlideIn 0.3s ease-out' : 'popupSlideOut 0.2s ease-in'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                type === 'success' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-black tracking-tight">
                {title}
              </h3>
            </div>
            
            {/* 닫기 버튼 (success 타입에서만 표시) */}
            {type === 'success' && (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <X className="w-4 h-4 text-black/60" />
              </button>
            )}
          </div>
        </div>

        {/* 메시지 */}
        <div className="px-6 pb-6">
          <p className="text-black/80 leading-relaxed">
            {message}
          </p>
        </div>

        {/* 버튼 영역 (confirm 타입에서만) */}
        {type === 'confirm' && (
          <div className="px-6 pb-6">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-black/5 hover:bg-black/10 text-black font-semibold rounded-lg transition-all duration-200 active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-black hover:bg-black/80 text-white font-semibold rounded-lg transition-all duration-200 active:scale-95 hover:shadow-lg"
              >
                {confirmText}
              </button>
            </div>
          </div>
        )}

        {/* 자동 닫기 진행바 (success + autoClose) */}
        {type === 'success' && autoClose && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all ease-linear"
              style={{
                animation: `progressBar ${autoCloseDelay}ms linear`
              }}
            />
          </div>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes popupSlideOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
        }

        @keyframes progressBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );

  // Portal로 body에 직접 렌더링
  return typeof window !== 'undefined' ? createPortal(popup, document.body) : null;
};

export default PopupNotification;