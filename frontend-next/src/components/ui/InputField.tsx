"use client";
"use client";
import React from 'react';

interface InputFieldProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  icon,
  className = '',
  disabled = false,
  required = false,
  id,
  name,
}) => {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-orange-500 focus:border-transparent
          transition-all duration-300
          ${icon ? 'pl-10' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      />
    </div>
  );
};

export default InputField;
