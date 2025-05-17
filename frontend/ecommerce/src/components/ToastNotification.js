import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';

function ToastNotification({ show, onClose, title, message, subtitle, variant = 'success' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1060,
          transition: 'opacity 0.3s ease-in-out',
          opacity: show ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
        }}
      />

      {/* Notification Card */}
      <Card
        style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1070,
          minWidth: '300px',
          maxWidth: '90%',
          width: 'auto',
          textAlign: 'center',
          transition: 'all 0.3s ease-in-out',
          opacity: show ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: 'none',
          animation: show ? 'welcomeIn 0.5s ease-out' : 'welcomeOut 0.5s ease-in-out'
        }}
      >
        <Card.Body className="p-4">
          <div className="welcome-icon mb-3">
            <FontAwesomeIcon 
              icon={faGift} 
              style={{ 
                fontSize: '2.5rem',
                color: '#0275d8',
                animation: show ? 'iconBounce 0.5s ease-out 0.2s both' : 'none'
              }}
            />
          </div>
          
          <h3 className="mb-3" style={{
            color: '#2c3e50',
            animation: show ? 'slideIn 0.5s ease-out 0.1s both' : 'none'
          }}>{title}</h3>
          
          <div className="mb-2" style={{ 
            fontSize: '1.2rem',
            color: '#34495e',
            animation: show ? 'slideIn 0.5s ease-out 0.2s both' : 'none'
          }}>{message}</div>
          
          {subtitle && (
            <div style={{ 
              fontSize: '1rem',
              color: '#7f8c8d',
              animation: show ? 'slideIn 0.5s ease-out 0.3s both' : 'none'
            }}>{subtitle}</div>
          )}
        </Card.Body>
      </Card>

      <style>
        {`
          @keyframes welcomeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }

          @keyframes welcomeOut {
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
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes iconBounce {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.1);
            }
            70% {
              opacity: 0.9;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </>
  );
}

export default ToastNotification; 