import React, { useEffect, useRef } from 'react';
import { FiMapPin } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons using locally imported icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({ latitude, longitude, darkMode, weather }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Only initialize map if coordinates exist and container is ready
    if (!latitude || !longitude || !mapRef.current) return;

    // Create map if it doesn't exist
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapInstance.current);
    } else {
      // Update view if map already exists
      mapInstance.current.setView([latitude, longitude], 12);
    }

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = L.marker([latitude, longitude], { icon: DefaultIcon })
        .addTo(mapInstance.current);
    }

    // Add weather popup if weather data exists
    if (weather && markerRef.current) {
      markerRef.current.bindPopup(`
        <div class="${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-2">
          ${weather.cityName}: ${Math.round(weather.current.temperature_2m)}°
        </div>
      `).openPopup();
    }

    // Clean up map when component unmounts
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
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
