import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';

const Notification = ({ show, onClose, title, message, variant = 'primary' }) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      animation={true}
      backdrop={true}
      size="md"
      className="welcome-modal"
    >
      <Modal.Header className={`bg-${variant} text-white`}>
        <Modal.Title className="w-100 text-center">
          <FontAwesomeIcon icon={faGift} className="me-2" /> {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <h4>{message}</h4>
        <p className="mt-3 mb-0">We hope you enjoy shopping with us!</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pt-0">
        <Button 
          variant={variant} 
          onClick={onClose}
          className="px-4"
        >
          Start Shopping
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Notification; 