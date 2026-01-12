import { createContext, useContext, useEffect, useState } from "react";

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;

    document.body.classList.toggle("high-contrast", highContrast);
    document.body.classList.toggle("dark-mode", darkMode);
  }, [fontScale, highContrast, darkMode]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        setFontScale,
        highContrast,
        setHighContrast,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
