import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiSun, FiMoon, FiThermometer, FiDroplet, FiWind, FiBarChart } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';


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
    <WeatherDetailItem 
      icon={<FiThermometer className="w-5 h-5" />}
      label="Feels like"
      value={`${Math.round(weather.main.feels_like)}°`}
      darkMode={darkMode}
    />
    <WeatherDetailItem
      icon={<FiDroplet className="w-5 h-5" />}
      label="Humidity"
      value={`${weather.main.humidity}%`}
      darkMode={darkMode}
    />
    <WeatherDetailItem
      icon={<FiWind className="w-5 h-5" />}
      label="Wind"
      value={`${weather.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}`}
      darkMode={darkMode}
    />
    <WeatherDetailItem
      icon={<FiBarChart className="w-5 h-5" />}
      label="Pressure"
      value={`${weather.main.pressure} hPa`}
      darkMode={darkMode}
    />
  </div>
);

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('New York');
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [loading, setLoading] = useState(false);

  const fetchData = async (searchCity) => {
    setLoading(true);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: searchCity,
            appid: import.meta.env.VITE_APP_WEATHER_API_KEY,
            units: unit
          }
        }),
        axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            q: searchCity,
            appid: import.meta.env.VITE_APP_WEATHER_API_KEY,
            units: unit,
            cnt: 40
          }
        })
      ]);

      const processForecast = (current, forecast) => {
        const days = new Map();
        const currentDate = new Date(current.dt * 1000);
        currentDate.setHours(12, 0, 0, 0);
        
        days.set(currentDate.toDateString(), {
          ...current.weather[0],
          temp: current.main.temp,
          dt: current.dt
        });

        forecast.list.forEach(item => {
          const date = new Date(item.dt * 1000);
          date.setHours(12, 0, 0, 0);
          if (!days.has(date.toDateString())) {
            days.set(date.toDateString(), {
              ...item.weather[0],
              temp: item.main.temp,
              dt: item.dt
            });
          }
        });

        return Array.from(days.values()).slice(0, 6); // Fixed to 6 days
      };

      setWeather(currentRes.data);
      setForecast(processForecast(currentRes.data, forecastRes.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('New York');
  }, []);

  useEffect(() => {
    if (city) fetchData(city);
  }, [unit, city]); // Added city to dependencies

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) fetchData(city.trim());
  };

  const formatDate = (timestamp) => 
    new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-800'
    }`}>
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="animate-pulse">⛅</span>
            Aeris
          </h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </header>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city..."
            className={`flex-1 p-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white shadow-sm'
            }`}
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FiSearch size={20} />
            )}
          </button>
        </form>

        <div className="flex gap-2 mb-8 justify-center">
          <button
            onClick={() => setUnit('metric')}
            className={`px-4 py-2 rounded-full transition-all ${
              unit === 'metric' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`px-4 py-2 rounded-full transition-all ${
              unit === 'imperial' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
            }`}
          >
            °F
          </button>
        </div>

        {weather && (
          <div className={`p-6 rounded-2xl mb-8 backdrop-blur-lg ${
            darkMode ? 'bg-gray-800/80 shadow-xl' : 'bg-white/90 shadow-lg'
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                    alt="weather icon"
                    className="w-24 h-24 animate-fade-in"
                  />
                  <div>
                    <h2 className="text-3xl font-bold">{weather.name}</h2>
                    <p className="text-lg opacity-75">{formatDate(weather.dt)}</p>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-4">
                  {Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                  <span className="text-xl ml-2 capitalize">{weather.weather[0].description}</span>
                </p>
              </div>
              <WeatherDetails weather={weather} unit={unit} darkMode={darkMode} />
            </div>
          </div>
        )}

        {forecast && (
          <div className={`rounded-2xl p-4 backdrop-blur-lg mt-4 ${
            darkMode ? 'bg-gray-800/80 shadow-xl' : 'bg-white/90 shadow-lg'
          }`}>
            <h3 className="text-xl font-bold mb-6 text-center">6-Day Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {forecast.map((day, index) => (
                <div 
                  key={day.dt} 
                  className={`p-2 rounded-xl transition-all flex flex-col items-center ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {index === 0 ? 'Today' : 
                      new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
                    }
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                    alt="weather icon"
                    className="w-12 h-12 mx-auto mb-1"
                  />
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-semibold">
                      {Math.round(day.temp)}°
                    </span>
                    <span className="text-xs opacity-75">
                      {unit === 'metric' ? 'C' : 'F'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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