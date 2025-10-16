'use client';

import { useState, useEffect } from 'react';

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  errorType?: 'network' | 'timeout' | 'server' | 'validation' | 'config' | 'unknown';
  details?: string;
  retryAction?: () => void;
  helpUrl?: string;
}

const ErrorModal = ({
  isOpen,
  onClose,
  title,
  message,
  errorType = 'unknown',
  details,
  retryAction,
  helpUrl
}: ErrorModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  if (!isVisible) return null;

  // 에러 타입별 아이콘 (모노톤 디자인)
  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'network':
        return (
          <svg className="error-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      case 'timeout':
        return (
          <svg className="error-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'server':
        return (
          <svg className="error-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'config':
        return (
          <svg className="error-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'validation':
        return (
          <svg className="error-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="error-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getDefaultTitle = (type: string) => {
    switch (type) {
      case 'network': return '연결 문제';
      case 'timeout': return '시간 초과';
      case 'server': return '서버 오류';
      case 'config': return '설정 오류';
      case 'validation': return '입력 오류';
      default: return '오류 발생';
    }
  };

  const modalTitle = title || getDefaultTitle(errorType);

  return (
    <>
      <style jsx>{`
        .error-modal {
          position: fixed;
          inset: 0;
          z-index: var(--elev-overlay);
          display: grid;
          place-items: center;
          transition: opacity var(--dur-slow) var(--ease-standard);
        }
        
        .error-modal--hidden {
          opacity: 0;
          pointer-events: none;
        }
        
        .error-modal__overlay {
          position: absolute;
          inset: 0;
          background: var(--scrim);
          backdrop-filter: blur(var(--backdrop-blur));
        }
        
        .error-modal__panel {
          position: relative;
          background: var(--color-surface);
          border: var(--border-thin) solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: min(600px, 92vw);
          transform: translateY(var(--motion-distance));
          transition: transform var(--dur-slow) var(--ease-standard);
        }
        
        .error-modal--open .error-modal__panel {
          transform: none;
        }
        
        .error-modal__header {
          background: var(--color-bg-alt);
          border-bottom: var(--border-thin) solid var(--color-border);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        
        .error-modal__icon {
          width: 32px;
          height: 32px;
          color: var(--color-danger);
          flex-shrink: 0;
        }
        
        .error-modal__title {
          font-size: var(--fs-h4-d);
          line-height: var(--lh-heading);
          font-weight: 600;
          color: var(--color-text-high);
          margin: 0;
          flex: 1;
        }
        
        .error-modal__close {
          color: var(--color-text-medium);
          background: none;
          border: none;
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: color var(--dur-md) var(--ease-standard);
          flex-shrink: 0;
        }
        
        .error-modal__close:hover {
          color: var(--color-text-high);
        }
        
        .error-modal__close:focus-visible {
          outline: 2px solid var(--color-focus);
          outline-offset: 2px;
        }
        
        .error-modal__close svg {
          width: 20px;
          height: 20px;
        }
        
        .error-modal__body {
          padding: var(--space-xl);
        }
        
        .error-modal__message {
          font-size: var(--fs-body-d);
          line-height: var(--lh-body);
          color: var(--color-text-medium);
          margin: 0 0 var(--space-lg);
        }
        
        .error-modal__details {
          margin-bottom: var(--space-lg);
        }
        
        .error-modal__details summary {
          font-size: var(--fs-body-s-d);
          color: var(--color-text-low);
          cursor: pointer;
          user-select: none;
          transition: color var(--dur-md) var(--ease-standard);
        }
        
        .error-modal__details summary:hover {
          color: var(--color-text-medium);
        }
        
        .error-modal__details-content {
          margin-top: var(--space-xs);
          padding: var(--space-sm);
          background: var(--color-bg-alt);
          border: var(--border-thin) solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace;
          font-size: var(--fs-caption);
          color: var(--color-text-low);
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .error-modal__help {
          margin-bottom: var(--space-lg);
        }
        
        .error-modal__help-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--fs-body-s-d);
          color: var(--color-text-high);
          text-decoration: none;
          transition: text-decoration var(--dur-md) var(--ease-standard);
        }
        
        .error-modal__help-link:hover {
          text-decoration: underline;
        }
        
        .error-modal__help-link svg {
          width: 16px;
          height: 16px;
        }
        
        .error-modal__actions {
          background: var(--color-bg-alt);
          border-top: var(--border-thin) solid var(--color-border);
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          padding: var(--space-lg);
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-md);
          border: var(--border-thin) solid transparent;
          font-weight: 600;
          font-size: var(--fs-h6-d);
          line-height: 1.2;
          cursor: pointer;
          transition: background var(--dur-md) var(--ease-standard), 
                     transform var(--dur-fast) var(--ease-standard);
        }
        
        .btn:focus-visible {
          outline: 2px solid var(--color-focus);
          outline-offset: 2px;
        }
        
        .btn:active {
          transform: scale(0.98);
        }
        
        .btn--secondary {
          background: var(--color-bg);
          color: var(--color-text-high);
          border-color: var(--color-border);
        }
        
        .btn--secondary:hover {
          background: var(--color-bg-alt);
        }
        
        .btn--primary {
          background: var(--color-primary);
          color: var(--color-bg);
        }
        
        .btn--primary:hover {
          background: var(--color-primary-hover);
        }
        
        @media (max-width: 640px) {
          .error-modal__title {
            font-size: var(--fs-h4-m);
          }
          
          .error-modal__header {
            padding: var(--space-md);
          }
          
          .error-modal__body {
            padding: var(--space-lg);
          }
          
          .error-modal__actions {
            padding: var(--space-md);
            flex-direction: column;
          }
          
          .error-modal__message {
            font-size: var(--fs-body-m);
          }
          
          .error-modal__details summary {
            font-size: var(--fs-body-s-m);
          }
          
          .error-modal__help-link {
            font-size: var(--fs-body-s-m);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .error-modal,
          .error-modal__panel,
          .error-modal__close,
          .btn {
            transition: none;
          }
        }
      `}</style>

      <div 
        className={`error-modal ${isOpen ? 'error-modal--open' : 'error-modal--hidden'}`}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="error-modal-title"
      >
        <div 
          className="error-modal__overlay"
          onClick={onClose}
        />
        
        <div className="error-modal__panel">
          <div className="error-modal__header">
            <div className="error-modal__icon-wrapper">
              {getErrorIcon(errorType)}
            </div>
            <h2 id="error-modal-title" className="error-modal__title">
              {modalTitle}
            </h2>
            <button
              onClick={onClose}
              className="error-modal__close"
              aria-label="닫기"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="error-modal__body">
            <p className="error-modal__message">
              {message}
            </p>

            {details && (
              <details className="error-modal__details">
                <summary>기술적 세부사항 보기</summary>
                <div className="error-modal__details-content">
                  {details}
                </div>
              </details>
            )}

            {helpUrl && (
              <div className="error-modal__help">
                <a 
                  href={helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="error-modal__help-link"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  도움말 보기
                </a>
              </div>
            )}
          </div>

          <div className="error-modal__actions">
            <button
              onClick={onClose}
              className="btn btn--secondary"
            >
              닫기
            </button>
            
            {retryAction && (
              <button
                onClick={() => {
                  onClose();
                  retryAction();
                }}
                className="btn btn--primary"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorModal;