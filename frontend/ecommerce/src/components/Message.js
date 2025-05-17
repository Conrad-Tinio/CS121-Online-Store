import React from 'react'
import { Alert } from 'react-bootstrap'

function Message({ variant, children }) {
    const getStyle = (variant) => {
        if (variant === 'info') {
            return {
                backgroundColor: '#e8f4ff',
                borderColor: '#0275d8',
                color: '#0275d8'
            }
        }
        return {}
    }

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