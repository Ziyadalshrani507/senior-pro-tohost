import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapPicker.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center changes
function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // Round to 4 decimal places
      const roundedLat = Number(lat.toFixed(4));
      const roundedLng = Number(lng.toFixed(4));
      onPositionChange([roundedLng, roundedLat]);
    }
  });
  return null;
}

const MapPicker = ({ position, onPositionChange }) => {
  // Default center on Riyadh, Saudi Arabia if no position is provided
  const center = position ? [position[1], position[0]] : [24.7136, 46.6753];

  const handleInputChange = (value, isLatitude) => {
    const number = parseFloat(value);
    if (isNaN(number)) return;

    // Round to 4 decimal places
    const rounded = Number(number.toFixed(4));
    
    if (isLatitude && rounded >= -90 && rounded <= 90) {
      onPositionChange([position[0], rounded]);
    } else if (!isLatitude && rounded >= -180 && rounded <= 180) {
      onPositionChange([rounded, position[1]]);
    }
  };

  return (
    <div className="map-picker-container">
      <MapContainer
        center={center}
        zoom={13}
        className="map-picker"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {position && (
          <Marker position={[position[1], position[0]]} />
        )}
        <MapCenter center={center} />
        <MapClickHandler onPositionChange={onPositionChange} />
      </MapContainer>
      <div className="coordinates-display">
        {position ? (
          <>
            <div className="coordinate">
              <label>Latitude:</label>
              <input
                type="number"
                value={position[1]}
                onChange={(e) => handleInputChange(e.target.value, true)}
                step="0.0001"
                min="-90"
                max="90"
              />
            </div>
            <div className="coordinate">
              <label>Longitude:</label>
              <input
                type="number"
                value={position[0]}
                onChange={(e) => handleInputChange(e.target.value, false)}
                step="0.0001"
                min="-180"
                max="180"
              />
            </div>
          </>
        ) : (
          <p className="no-coordinates">Click on the map to set location coordinates</p>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
