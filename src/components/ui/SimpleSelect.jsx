import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const SimpleSelect = ({ 
  value, 
  onChange, 
  options = [], 
  disabled = false,
  placeholder = "Select...",
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  // Find the selected option
  const selectedOption = options.find(opt => opt.value === value);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Select Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600 cursor-pointer'
        }`}
      >
        <span className={`${selectedOption?.className || ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-800 ${
                option.value === value 
                  ? 'bg-yellow-900/30 text-yellow-400' 
                  : 'text-white'
              } ${option.className || ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleSelect;