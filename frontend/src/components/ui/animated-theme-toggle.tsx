import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useApp } from "@/context/AppContext";

export const AnimatedThemeToggle = ({
  className,
  theme: controlledTheme,
  onToggle,
}: {
  className?: string;
  theme?: "light" | "dark";
  onToggle?: () => void;
}) => {
  let appContext: ReturnType<typeof useApp> | null = null;
  try {
    appContext = useApp();
  } catch {
    // Context not available in isolation
  }

  const [localTheme, setLocalTheme] = useState<string>(() => {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    return "light";
  });

  const activeTheme = controlledTheme ?? (appContext ? appContext.theme : localTheme);
  const isDark = activeTheme === "dark";

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else if (appContext) {
      appContext.toggleTheme();
    } else {
      setLocalTheme(isDark ? "light" : "dark");
    }
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
      className={cn(
        "relative p-2 h-9 w-9 rounded-lg transition-colors duration-200 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-80",
        className
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <SolarSwitch isDark={isDark} />
    </button>
  );
};

const sunCoreVariants: Variants = {
  dark: {
    scale: 0,
    pathLength: 0,
    opacity: 0,
    transition: { duration: 0.45, ease: "easeInOut" },
  },
  light: {
    scale: 1,
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.55, ease: "easeInOut" },
  },
};

const sunRayVariants: Variants = {
  dark: {
    scale: 0,
    pathLength: 0,
    opacity: 0,
    transition: { duration: 0.35, ease: "easeInOut" },
  },
  light: {
    scale: 1,
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.55, ease: "easeInOut", delay: 0.08 },
  },
};

const moonVariants: Variants = {
  dark: {
    scale: 1,
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.55, ease: "easeInOut", delay: 0.08 },
  },
  light: {
    scale: 0,
    pathLength: 0,
    opacity: 0,
    transition: { duration: 0.35, ease: "easeInOut" },
  },
};

const SolarSwitch = ({ isDark }: { isDark: boolean }) => {
  const currentVariant = isDark ? "dark" : "light";

  return (
    <div className="relative flex items-center justify-center w-5 h-5 pointer-events-none">
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: isDark ? 90 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: "12.5px 12.5px" }}
      >
        {/* Sun center core */}
        <motion.path
          d="M12.4058 17.7625C15.1672 17.7625 17.4058 15.5239 17.4058 12.7625C17.4058 10.0011 15.1672 7.76251 12.4058 7.76251C9.64434 7.76251 7.40576 10.0011 7.40576 12.7625C7.40576 15.5239 9.64434 17.7625 12.4058 17.7625Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunCoreVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        {/* Sun radiating rays */}
        <motion.path
          d="M12.4058 1.76251V3.76251"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunRayVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        <motion.path
          d="M12.4058 21.7625V23.7625"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunRayVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        <motion.path
          d="M4.62598 4.98248L6.04598 6.40248"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunRayVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        <motion.path
          d="M18.7656 19.1225L20.1856 20.5425"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunRayVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        <motion.path
          d="M1.40576 12.7625H3.40576"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunRayVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        <motion.path
          d="M21.4058 12.7625H23.4058"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunRayVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        <motion.path
          d="M4.62598 20.5425L6.04598 19.1225"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunRayVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        <motion.path
          d="M18.7656 6.40248L20.1856 4.98248"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={sunRayVariants}
          style={{ transformOrigin: "12.4058px 12.7625px" }}
        />
        {/* Moon crescent */}
        <motion.path
          d="M21.1918 13.2013C21.0345 14.9035 20.3957 16.5257 19.35 17.8781C18.3044 19.2305 16.8953 20.2571 15.2875 20.8379C13.6797 21.4186 11.9398 21.5294 10.2713 21.1574C8.60281 20.7854 7.07479 19.9459 5.86602 18.7371C4.65725 17.5283 3.81774 16.0003 3.4457 14.3318C3.07367 12.6633 3.18451 10.9234 3.76526 9.31561C4.346 7.70783 5.37263 6.29868 6.72501 5.25307C8.07739 4.20746 9.69959 3.56862 11.4018 3.41132C10.4052 4.75958 9.92564 6.42077 10.0503 8.09273C10.175 9.76469 10.8957 11.3364 12.0812 12.5219C13.2667 13.7075 14.8384 14.4281 16.5104 14.5528C18.1823 14.6775 19.8435 14.1979 21.1918 13.2013Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={currentVariant}
          variants={moonVariants}
          style={{ transformOrigin: "12.5px 12.5px" }}
        />
      </motion.svg>
    </div>
  );
};
