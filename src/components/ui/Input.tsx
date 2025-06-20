import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  type?: 'text' | 'email' | 'password' | 'search';
  icon?: LucideIcon;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  onKeyPress,
  type = 'text',
  icon: Icon,
  error,
  disabled = false,
  className = '',
}: InputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-neutral-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full rounded-2xl border-2 border-neutral-200 px-4 py-3 text-neutral-900 placeholder-neutral-500 transition-all duration-300
            focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none
            disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
            hover:border-neutral-300
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/10' : ''}
          `}
        />
      </div>
      
      {error && (
        <p className="text-sm text-error-600 font-medium">{error}</p>
      )}
    </div>
  );
}