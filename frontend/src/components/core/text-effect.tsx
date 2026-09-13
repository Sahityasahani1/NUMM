import React, { useEffect, useState } from 'react';

export interface TextEffectProps {
  children: string;
  per?: 'char' | 'word';
  preset?: 'fade' | 'slide' | 'blur';
  className?: string;
  delay?: number; // initial delay in ms
  stagger?: number; // delay per token in ms
}

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  per = 'char',
  preset = 'fade',
  className = '',
  delay = 50,
  stagger = 20,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  const tokens = per === 'char' ? Array.from(children) : children.split(' ');

  return (
    <span className={`inline-block ${className}`} aria-label={children}>
      {tokens.map((token, index) => {
        const isSpace = token === ' ';
        const tokenDelay = `${(index * stagger) / 1000}s`;

        return (
          <span
            key={index}
            className="inline-block transition-all duration-300 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted
                ? 'translateY(0)'
                : preset === 'slide'
                ? 'translateY(8px)'
                : preset === 'blur'
                ? 'translateY(4px) scale(0.98)'
                : 'translateY(3px)',
              filter: preset === 'blur' ? (mounted ? 'blur(0px)' : 'blur(4px)') : undefined,
              transitionDelay: tokenDelay,
            }}
          >
            {isSpace ? '\u00A0' : token}
            {per === 'word' && index < tokens.length - 1 ? '\u00A0' : ''}
          </span>
        );
      })}
    </span>
  );
};
