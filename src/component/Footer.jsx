import React from 'react'
import { FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = ({ darkMode }) => {
  return (
    <div className={`py-6 ${darkMode ? 'bg-gray-900 text-gray-300 border-t border-gray-800' : 'bg-gray-100 text-gray-700 border-t border-gray-200'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          
          {/* About Section */}
          <div className="max-w-md mb-2">
            <h3 className="text-sm font-semibold mb-1">Aeris Weather</h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Derived from Latin meaning "air", Aeris delivers precise weather forecasts 
              with a clean interface. Your modern atmospheric companion.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-5">
            <a 
              href="https://www.linkedin.com/in/zakaria-moumni-98637625a/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`hover:opacity-75 transition-opacity ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              <FaLinkedin size={20} />
            </a>
            <a 
              href="https://github.com/MoumniZakaria" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`hover:opacity-75 transition-opacity ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <FaGithub size={20} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs opacity-75 mt-2">
            © {new Date().getFullYear()} Aeris. All rights reserved.
          </p>
          <p className="text-xs opacity-75">Zmoumni, 1337 Kh</p>
        </div>
      </div>
    </div>
  )
}

export default Footer