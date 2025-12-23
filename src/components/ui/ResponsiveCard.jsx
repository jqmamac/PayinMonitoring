// src/components/ui/ResponsiveCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ResponsiveCard = ({ children, className = '', padding = 'default' }) => {
  const paddingClasses = {
    default: 'p-4 sm:p-6',
    compact: 'p-3 sm:p-4',
    loose: 'p-6 sm:p-8',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default ResponsiveCard;