import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`premium-button ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
