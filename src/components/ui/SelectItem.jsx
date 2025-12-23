import React from 'react';

const SelectItem = ({ 
  value, 
  children, 
  className = '',
  onSelect,
  isSelected = false
}) => {
  return (
    <div
      onClick={() => onSelect && onSelect(value)}
      className={`px-3 py-2 text-sm text-white cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-between ${className}`}
    >
      <span>{children}</span>
      {isSelected && (
        <span className="text-yellow-400">
          ✓
        </span>
      )}
    </div>
  );
};

export default SelectItem;