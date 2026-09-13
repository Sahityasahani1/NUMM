import React from 'react';

export interface TextShimmerProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  duration?: number; // duration in seconds, default 2
}

export const TextShimmer: React.FC<TextShimmerProps> = ({
  children,
  as: Component = 'span',
  className = '',
  duration = 2,
}) => {
  return (
    <Component
      className={`inline-block bg-[length:250%_100%] bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.4) 100%)',
        animation: `textShimmer ${duration}s infinite linear`,
      }}
    >
      {children}
    </Component>
  );
};
