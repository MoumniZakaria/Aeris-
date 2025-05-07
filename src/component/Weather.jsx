import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiSun, FiMoon, FiThermometer, FiDroplet, FiWind, FiCompass } from 'react-icons/fi';

// Free weather API from OpenMeteo
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

const WeatherApp = ({ onWeatherUpdate, onDarkModeToggle }) => {
  const [darkMode, setDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('celsius'); // celsius or fahrenheit
  const [show, SetShow] = useState(0);

  // Pass dark mode changes to parent
  useEffect(() => {
    if (onDarkModeToggle) {
      onDarkModeToggle(darkMode);
    }
  }, [darkMode, onDarkModeToggle]);

  // Search for cities as user types
  useEffect(() => {
    // Don't search if input is too short
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Set up cancellation for fetch requests
    const controller = new AbortController();
    const signal = controller.signal;
    
    const searchTimer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${GEOCODING_API}?name=${encodeURIComponent(input)}&count=5`, 
          { signal }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setSuggestions(data.results || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching city suggestions:', err);
          setSuggestions([]);
        }
      }
    }, 300);
    
    return () => {
      clearTimeout(searchTimer);
      controller.abort();
    };
  }, [input]);

  const fetchWeather = useCallback(async (lat, lon, cityName) => {
    if (!lat || !lon || !cityName) {
      console.error('Missing required parameters for weather fetch');
      return;
    }
    
    setLoading(true);
    setSuggestions([]);
    
    try {
      const response = await fetch(
        `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&temperature_unit=${unit}`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const weatherData = {
        ...data,
        cityName,
        latitude: lat,
        longitude: lon
      };
      
      setWeather(weatherData);
      
      // Pass weather data to parent component
      if (onWeatherUpdate) {
        onWeatherUpdate(weatherData);
      }
      
      // Save to recent searches
      try {
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const newSearch = { lat, lon, name: cityName };
        
        // Only add if not already in list
        if (!recentSearches.some(city => city.name === cityName)) {
          localStorage.setItem(
            'recentSearches', 
            JSON.stringify([newSearch, ...recentSearches].slice(0, 5))
          );
        }
      } catch (storageError) {
        console.error('Error saving to local storage:', storageError);
      }
      
    } catch (err) {
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  }, [unit, onWeatherUpdate]);

  const handleSelectCity = (city) => {
    // Validate city data
    if (!city || !city.latitude || !city.longitude || !city.name) {
      console.error('Invalid city data:', city);
      return;
    }
    
    setInput(city.name);
    fetchWeather(city.latitude, city.longitude, city.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If we have suggestions, use the first one
    if (suggestions.length > 0) {
      handleSelectCity(suggestions[0]);
    }
  };

  // Get weather condition icon
  const getWeatherIcon = (code) => {
    // Convert WMO code to icon
    // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    if (code <= 3) return '☀️'; // Clear or mainly clear
    if (code <= 9) return '🌤️'; // Partly cloudy
    if (code <= 19) return '☁️'; // Cloudy
    if (code <= 29) return '🌧️'; // Rain
    if (code <= 39) return '❄️'; // Snow
    if (code <= 49) return '🌫️'; // Fog
    if (code <= 59) return '🌧️'; // Drizzle
    if (code <= 69) return '🌧️'; // Rain
    if (code <= 79) return '❄️'; // Snow
    if (code <= 99) return '⛈️'; // Thunderstorm
    return '🌡️';
  };

  // Wind direction to text
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="transition-colors duration-300 h-full">
      <div className="h-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Weather Forecast</h2>
          <div className="flex items-center gap-3">
            {/* <button 
              onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
              className={`text-sm px-3 py-1 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white/70 hover:bg-white'
              }`}
            >
              {unit === 'celsius' ? '°C' : '°F'}
            </button> */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white/70 hover:bg-white'
              }`}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>
        </header>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search for a city..."
                className={`w-full p-3 pl-10 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur shadow-sm'
                }`}
              />
              <FiSearch size={18} className="absolute left-3 top-3.5 opacity-50" />
            </div>
            <button 
              type="submit" 
              className={`p-3 rounded-xl ${
                darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors`}
            >
              Search
            </button>
          </div>
          {/* City suggestions */}
          {suggestions.length > 0 && (
            <div className={`absolute z-10 mt-1 w-[89%] rounded-xl shadow-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <ul className={`display:${show}`}>
                {suggestions.map((city) => (
                  <li 
                    key={`${city.id || city.name}-${city.name}`}
                    onClick={() => handleSelectCity(city)}
                    className={`p-3 cursor-pointer flex items-center gap-2 ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="text-sm opacity-70">
                      {city.country}
                      {city.admin1 && `, ${city.admin1}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="loader">
              <div className={`loader-inner ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
            </div>
          </div>
        )}

        {/* Weather display */}
        {weather && !loading && (
          <div className={`rounded-2xl overflow-hidden ${
            darkMode ? 'bg-gray-800/70' : 'bg-white/70 backdrop-blur'
          } shadow-lg`}>
            {/* Current weather */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{weather.cityName}</h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date().toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-light">
                    {Math.round(weather.current.temperature_2m)}°
                  </div>
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Feels like {Math.round(weather.current.apparent_temperature)}°
                  </div>
                </div>
              </div>

              {/* Weather stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <WeatherCard
                  icon={<FiThermometer size={18} />}
                  title="Temperature"
                  value={`${Math.round(weather.daily.temperature_2m_min[0])}° / ${Math.round(weather.daily.temperature_2m_max[0])}°`}
                  darkMode={darkMode}
                />
                <WeatherCard
                  icon={<FiDroplet size={18} />}
                  title="Humidity"
                  value={`${weather.current.relative_humidity_2m}%`}
                  darkMode={darkMode}
                />
                <WeatherCard
                  icon={<FiWind size={18} />}
                  title="Wind"
                  value={`${Math.round(weather.current.wind_speed_10m)} km/h ${getWindDirection(weather.current.wind_direction_10m)}`}
                  darkMode={darkMode}
                />
                <WeatherCard
                  icon={<FiCompass size={18} />}
                  title="Precipitation"
                  value={`${weather.current.precipitation} mm`}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* 7-day forecast */}
            <div className={`p-6 ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100/50'}`}>
              <h3 className="font-semibold mb-4">7-Day Forecast</h3>
              <div className="grid grid-cols-7 gap-2">
                {weather.daily.time.map((day, index) => (
                  <div 
                    key={day}
                    className={`flex flex-col items-center text-center ${index === 0 ? 'font-semibold' : ''}`}
                  >
                    <div className="text-sm mb-1">
                      {new Date(day).toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className="text-xl mb-1">
                      {getWeatherIcon(weather.daily.weather_code[index])}
                    </div>
                    <div className="text-sm">
                      {Math.round(weather.daily.temperature_2m_max[index])}°
                    </div>
                    <div className="text-xs opacity-70">
                      {Math.round(weather.daily.temperature_2m_min[index])}°
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Initial state */}
        {!loading && !weather && (
          <div className={`mt-20 p-6 rounded-xl ${darkMode ? 'bg-gray-800/70' : 'bg-white/70'} `}>
            <h3 className="font-semibold mb-3">Try searching for a city to get started</h3>
            <p className="text-sm opacity-70">Example: London, Tokyo, New York, Rabat, Paris</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Weather card component for stats
const WeatherCard = ({ icon, title, value, darkMode }) => (
  <div className={`p-3 rounded-xl ${
    darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
  }`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
        {icon}
      </div>
      <div className="text-xs opacity-75">{title}</div>
    </div>
    <div className="font-semibold">{value}</div>
  </div>
);

export default WeatherApp;