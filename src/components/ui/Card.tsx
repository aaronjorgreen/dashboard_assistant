import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  onClick
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      className={`bg-white/90 backdrop-blur-sm rounded-3xl border border-neutral-200/50 shadow-soft ${paddingClasses[padding]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={hover ? { 
        y: -4, 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.04)',
        scale: 1.02
      } : {}}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}