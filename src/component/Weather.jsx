import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import { FiSearch, FiSun, FiMoon, FiThermometer, FiDroplet, FiWind, FiBarChart } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';

// WeatherDetailItem and WeatherDetails components remain unchanged

const WeatherDetailItem = ({ icon, label, value, darkMode }) => (
  <div className={`p-3 rounded-xl flex items-center gap-3 ${
    darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'
  }`}>
    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs opacity-75">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  </div>
);

const WeatherDetails = ({ weather, unit, darkMode }) => (
  <div className="grid grid-cols-2 md:grid-cols-2 gap-3 w-[50%]">
    {/* Weather detail items remain unchanged */}
  </div>
);

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [inputValue, setInputValue] = useState('New York');
  const [searchCity, setSearchCity] = useState('New York');
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [loading, setLoading] = useState(false);
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  useEffect(() => {
    if (debouncedInputValue.trim()) {
      setSearchCity(debouncedInputValue.trim());
    }
  }, [debouncedInputValue]);

  const fetchData = async (city) => {
    setLoading(true);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: city,
            appid: import.meta.env.VITE_APP_WEATHER_API_KEY,
            units: unit
          }
        }),
        axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            q: city,
            appid: import.meta.env.VITE_APP_WEATHER_API_KEY,
            units: unit,
            cnt: 40
          }
        })
      ]);

      // processForecast function remains unchanged
      
      setWeather(currentRes.data);
      setForecast(processForecast(currentRes.data, forecastRes.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchCity);
  }, [searchCity, unit]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchCity(inputValue.trim());
    }
  };

  // formatDate function and return statement remain unchanged except for input value binding

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-800'
    }`}>
      <div className="max-w-3xl mx-auto">
        {/* Header remains unchanged */}

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search city..."
            className={`flex-1 p-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white shadow-sm'
            }`}
          />
          {/* Search button remains unchanged */}
        </form>

        {/* Unit toggle buttons remain unchanged */}

        {/* Weather display and forecast sections remain unchanged */}
        
        <ToastContainer 
          position="bottom-right" 
          theme={darkMode ? 'dark' : 'light'} 
          toastClassName="rounded-xl"
        />
      </div>
    </div>
  );
};

export default Weather;