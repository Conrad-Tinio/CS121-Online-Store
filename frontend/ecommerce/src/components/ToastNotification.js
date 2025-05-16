import React, { useState, useEffect } from 'react';
import { Toast } from 'react-bootstrap';

function ToastNotification({ show, onClose, title, message, subtitle, variant = 'success' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1070,
        minWidth: '300px',
        textAlign: 'center',
        transition: 'all 0.5s ease-in-out',
        opacity: show ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        animation: show ? 'fadeIn 0.5s ease-in-out' : 'fadeOut 0.5s ease-in-out'
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
            to {
              opacity: 0;
              transform: translate(-50%, -60%);
            }
          }
          @keyframes slideIn {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            from {
              transform: translateY(0);
              opacity: 1;
            }
            to {
              transform: translateY(20px);
              opacity: 0;
            }
          }
        `}
      </style>
      <Toast 
        show={show} 
        onClose={onClose} 
        delay={3000} 
        autohide
        bg={variant.toLowerCase()}
        className="text-white"
        style={{
          minWidth: '300px',
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: show ? 'slideIn 0.5s ease-out' : 'slideOut 0.5s ease-in-out'
        }}
      >
        <Toast.Header closeButton={false} className="justify-content-center">
          <strong className="mx-auto" style={{ 
            fontSize: '1.4rem',
            color: '#1a1a1a'
          }}>{title}</strong>
        </Toast.Header>
        <Toast.Body className="py-3">
          <div className="mb-2" style={{ 
            fontSize: '1.2rem',
            animation: show ? 'slideIn 0.5s ease-out 0.2s both' : 'slideOut 0.5s ease-in-out'
          }}>{message}</div>
          {subtitle && (
            <div style={{ 
              fontSize: '1rem', 
              opacity: 0.9,
              animation: show ? 'slideIn 0.5s ease-out 0.4s both' : 'slideOut 0.5s ease-in-out'
            }}>{subtitle}</div>
          )}
        </Toast.Body>
      </Toast>
    </div>
  );
}

export default ToastNotification; 