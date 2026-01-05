import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  background?: 'default' | 'gradient' | 'white' | 'gray';
  fullHeight?: boolean;
  allowOverflow?: boolean;
  className?: string;
}

/**
 * PageWrapper - Wrapper chuẩn cho các trang
 * Xử lý background, overflow, và các style cơ bản
 * 
 * @example
 * <PageWrapper background="gradient" fullHeight allowOverflow>
 *   <PageContainer maxWidth="90%">
 *     <YourContent />
 *   </PageContainer>
 * </PageWrapper>
 */
const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  background = 'default',
  fullHeight = true,
  allowOverflow = false,
  className = '',
}) => {
  const backgroundClasses = {
    default: 'bg-white',
    gradient: 'bg-gray-50',
    white: 'bg-white',
    gray: 'bg-gray-50',
  };

  const wrapperClass = `
    ${fullHeight ? 'h-screen' : 'min-h-screen'}
    ${backgroundClasses[background]}
    ${allowOverflow ? 'overflow-auto' : 'overflow-hidden'}
    w-full
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return <div className={wrapperClass}>{children}</div>;
};

export default PageWrapper;

