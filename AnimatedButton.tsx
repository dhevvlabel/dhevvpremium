import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      }}
      whileTap={{ 
        scale: 0.95, 
        rotate: -1,
        transition: { type: 'spring', stiffness: 500, damping: 15 }
      }}
      className={`relative active:shadow-inner transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
