import React, { useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap'

function Message({ variant, children, autoFade = false, fadeDuration = 5000 }) {
    const [opacity, setOpacity] = useState(1);
    const [display, setDisplay] = useState(true);
    
    useEffect(() => {
        if (autoFade) {
            const fadeTimer = setTimeout(() => {
                setOpacity(0);
            }, fadeDuration);
            
            const removeTimer = setTimeout(() => {
                setDisplay(false);
            }, fadeDuration + 1000); // Extra time for the transition to complete
            
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(removeTimer);
            };
        }
    }, [autoFade, fadeDuration]);

    const getStyle = (variant) => {
        const baseStyle = {
            opacity: opacity,
            transition: 'opacity 1s ease-out',
        };
        
        if (variant === 'info') {
            return {
                ...baseStyle,
                backgroundColor: '#e8f4ff',
                borderColor: '#0275d8',
                color: '#0275d8'
            }
        }
        return baseStyle;
    }

    if (!display) return null;

    return (
        <Alert variant={variant} style={getStyle(variant)}>
            {children}
        </Alert>
    )
}

Message.defaultProps = {
    variant: 'info'
}

export default Message