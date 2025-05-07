import React, { useState, useEffect } from 'react'
import Weather from './component/Weather'
import Map from './component/Map'
import Footer from './component/Footer'
import 'mapbox-gl/dist/mapbox-gl.css';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [darkMode, setDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Function to receive weather data from Weather component
  const handleWeatherUpdate = (data) => {
    setWeatherData(data);
  };

  // Function to handle dark mode toggle
  const handleDarkModeToggle = (mode) => {
    setDarkMode(mode);
  };

  return (
    <div className={`App flex flex-col min-h-screen ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'
    }`}>
      {/* Main content area */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto p-4">
          <header className="text-center mb-8 pt-4">
            <h1 className="text-3xl font-bold">Aeris Weather</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your modern atmospheric companion
            </p>
          </header>
          
          {/* Weather and Map layout - stack on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Weather 
              onWeatherUpdate={handleWeatherUpdate}
              onDarkModeToggle={handleDarkModeToggle} 
            />
            
            <Map 
              latitude={weatherData?.latitude} 
              longitude={weatherData?.longitude}
              darkMode={darkMode}
              weather={weatherData}
            />
          </div>
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer darkMode={darkMode} />
    </div>
  )
}

export default App