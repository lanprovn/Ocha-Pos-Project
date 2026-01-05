import React from 'react';

/**
 * Props interface for ButtonFilled component
 */
interface ButtonFilledProps {
  /** Content to display inside the button */
  children: React.ReactNode;
  /** Click handler function */
  onClick?: () => void;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A reusable filled button component with multiple variants and sizes
 * 
 * @param props - ButtonFilledProps
 * @returns JSX.Element
 * 
 * @example
 * ```tsx
 * <ButtonFilled variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </ButtonFilled>
 * ```
 */
const ButtonFilled: React.FC<ButtonFilledProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 outline-none focus:outline-none focus:ring-2 focus:ring-[#ff5a3c] focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[#ff5a3c] hover:bg-[#e54a2c] text-white shadow-md hover:shadow-lg',
    secondary: 'bg-[#ff8743] hover:bg-[#e6772b] text-white shadow-md hover:shadow-lg',
    danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-md hover:shadow-lg',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
};

export default ButtonFilled;
