import React, { useEffect, useRef } from 'react';
import { FiMapPin } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons (required for React)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const Map = ({ latitude, longitude, darkMode, weather }) => {
  const mapRef = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return;

    if (!map.current) {
      map.current = L.map(mapRef.current).setView([latitude, longitude], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map.current);
    }

    // Update marker
    if (marker.current) marker.current.setLatLng([latitude, longitude]);
    else {
      marker.current = L.marker([latitude, longitude], { icon: DefaultIcon })
        .addTo(map.current);
    }

    // Add weather popup
    if (weather) {
      marker.current.bindPopup(`
        <div class="${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-2">
          ${weather.cityName}: ${Math.round(weather.current.temperature_2m)}°
        </div>
      `);
    }

    return () => {
      if (map.current) map.current.remove();
    };
  }, [latitude, longitude, darkMode, weather]);


  return (
    <div className={`rounded-2xl overflow-hidden h-full ${
      darkMode ? 'bg-gray-800/70' : 'bg-white/70 backdrop-blur'
    } shadow-lg`}>
      <div className="p-4 border-b border-opacity-20 border-gray-500">
        <h2 className="font-bold flex items-center gap-2">
          <FiMapPin />
          Location Map
        </h2>
      </div>
      
      {latitude && longitude ? (
        <div 
          ref={mapRef} 
          className="relative w-full h-[400px] md:h-[500px]"
        ></div>
      ) : (
        <div className={`flex items-center justify-center h-[400px] md:h-[500px] ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Search for a location to display the map</p>
        </div>
      )}
    </div>
  );
};

export default Map;