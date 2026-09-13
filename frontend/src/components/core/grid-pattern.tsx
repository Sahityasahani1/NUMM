import React, { useId } from 'react';

export interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[x: number, y: number]>;
  strokeDasharray?: string;
  className?: string;
  [key: string]: any;
}

export const GridPattern: React.FC<GridPatternProps> = ({
  width = 48,
  height = 48,
  x = -1,
  y = -1,
  strokeDasharray = '4 2',
  squares,
  className = '',
  ...props
}) => {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full stroke-white/[0.12] fill-transparent ${className}`}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sqX, sqY], index) => (
            <rect
              strokeWidth="0"
              key={`${sqX}-${sqY}-${index}`}
              width={width - 1}
              height={height - 1}
              x={sqX * width + 1}
              y={sqY * height + 1}
              className="fill-violet-500/[0.14]"
            />
          ))}
        </svg>
      )}
    </svg>
  );
};
