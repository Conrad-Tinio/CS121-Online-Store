import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Card, Form } from 'react-bootstrap';
import fixLeafletIcon from '../LeafletFix';
import axios from 'axios';

// Initialize the fix for Leaflet icons
fixLeafletIcon();

// Component that handles map clicks and marker position
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? 
    <Marker position={position} /> : null;
};

const DeliveryLocationMap = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [initialPosition, setInitialPosition] = useState([14.5995, 120.9842]); // Default to Manila, Philippines

  // Try to get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Error getting location:', error);
          // Keep default location if geolocation fails
        }
      );
    }
  }, []);

  const handleSubmit = () => {
    if (position) {
      onLocationSelect({
        position,
        address
      });
    } else {
      alert('Please select a location on the map');
    }
  };

  return (
    <div className="map-container mb-4">
      <h4>Select Delivery Location</h4>
      <p>Click on the map to select your delivery location</p>
      
      <div style={{ height: '400px', width: '100%', marginBottom: '1rem' }}>
        <MapContainer 
          center={initialPosition} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      
      <Form.Group className="mb-3">
        <Form.Label>Delivery Address Details</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter additional address details (building name, floor, landmarks, etc.)"
        />
      </Form.Group>

      <Button 
        variant="primary" 
        onClick={handleSubmit}
        disabled={!position}
      >
        Confirm Location
      </Button>
    </div>
  );
};

export default DeliveryLocationMap; 