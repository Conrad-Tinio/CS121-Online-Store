import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Card } from 'react-bootstrap';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component that handles map clicks and marker position
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const DeliveryLocationMap = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');

  const handleConfirmLocation = async () => {
    if (!position) {
      alert('Please select a location on the map');
      return;
    }

    try {
      // Reverse geocoding using Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
      );
      const data = await response.json();
      const locationAddress = data.display_name;
      setAddress(locationAddress);

      onLocationSelect({
        position: [position.lat, position.lng],
        address: locationAddress
      });
    } catch (error) {
      console.error('Error getting address:', error);
      alert('Error getting address. Please try again.');
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <h4 className="mb-3">Select Delivery Location</h4>
        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer
            center={[14.5995, 120.9842]} // Manila coordinates
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <div className="mt-3">
          <Button 
            variant="primary" 
            onClick={handleConfirmLocation}
            disabled={!position}
          >
            Confirm Location
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DeliveryLocationMap; 