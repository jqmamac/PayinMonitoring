// src/components/ui/ResponsiveGrid.jsx
import React from 'react';

const ResponsiveGrid = ({ children, cols = 4, gap = 'default' }) => {
  const gapClasses = {
    default: 'gap-4 sm:gap-6',
    compact: 'gap-2 sm:gap-4',
    loose: 'gap-6 sm:gap-8',
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  return (
    <div className={`grid ${gridCols[cols]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;