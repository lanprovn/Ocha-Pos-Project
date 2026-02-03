"use client";
"use client";
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | '90%' | '80%';
  centered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * PageContainer - Component chuẩn để tạo các trang mới
 * Tránh các vấn đề về layout bị override bởi global CSS
 * 
 * @example
 * <PageContainer maxWidth="90%" centered padding="lg">
 *   <YourPageContent />
 * </PageContainer>
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'lg',
  centered = false,
  padding = 'md',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
    '90%': '',
    '80%': '',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3 md:p-4',
    md: 'p-3 sm:p-4 md:p-6 lg:p-8',
    lg: 'p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12',
  };

  const maxWidthStyle = maxWidth === '90%' || maxWidth === '80%'
    ? { maxWidth: maxWidth, width: maxWidth }
    : {};

  const containerClass = `
    w-full mx-auto
    ${maxWidth !== '90%' && maxWidth !== '80%' ? maxWidthClasses[maxWidth] : ''}
    ${centered ? 'flex items-center justify-center min-h-screen' : ''}
    ${paddingClasses[padding]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClass} style={maxWidthStyle}>
      {children}
    </div>
  );
};

export default PageContainer;

