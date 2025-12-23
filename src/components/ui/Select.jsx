import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ 
  value, 
  onValueChange, 
  disabled = false,
  className = '',
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'
        }`}
      >
        <span className="truncate">
          {React.Children.toArray(children).find(
            child => React.isValidElement(child) && child.props.value === value
          )?.props.children || 'Select...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {children}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ className = '', children, ...props }) => {
  return (
    <button
      type="button"
      className={`w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const SelectContent = ({ className = '', children }) => {
  return (
    <div className={`absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}>
      {children}
    </div>
  );
};

const SelectItem = ({ 
  value, 
  children, 
  className = '',
  onSelect 
}) => {
  return (
    <div
      onClick={() => onSelect && onSelect(value)}
      className={`px-3 py-2 text-sm text-white cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder = 'Select...', children }) => {
  return <span className="truncate">{children || placeholder}</span>;
};

export { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
};