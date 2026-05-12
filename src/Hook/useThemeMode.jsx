import { useState, useEffect } from "react";

export default function useThemeMode() {
  const THEME_KEY = "theme";
  const MANUAL_KEY = "manualThemeSet"; // New key to track manual setting

  // State to track if the user has manually toggled the theme
  const [isManual, setIsManual] = useState(
    () => localStorage.getItem(MANUAL_KEY) === "true"
  );
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem(THEME_KEY);

    // 1. If a saved mode exists, use it.
    if (savedMode) {
      return savedMode;
    }

    // 2. Fallback to light mode by default
    return "light";
  });

  // Effect 1: Handles state -> side effects (Save to storage and apply CSS class)
  useEffect(() => {
    // 1. Save the current mode using the standardized key
    localStorage.setItem(THEME_KEY, mode);

    // 2. Save the manual flag
    localStorage.setItem(MANUAL_KEY, isManual ? "true" : "false");

    // 3. Apply the class to the root element for Tailwind CSS
    document.documentElement.classList.toggle("dark", mode === "dark");
    
    // 4. Apply the data-theme attribute for DaisyUI components
    document.documentElement.setAttribute("data-theme", mode === "dark" ? "dark" : "light");

    setLoading(false);
  }, [mode, isManual]); // Added isManual dependency

  // Effect 2: Handles external events -> state change (Real-time sync)
  useEffect(() => {
    // --------------------------------------------------------
    // 1. Listen for cross-tab/window synchronization (storage event)
    // --------------------------------------------------------
    const handleStorageChange = (event) => {
      // Check for theme change
      if (event.key === THEME_KEY && event.newValue && event.newValue !== mode) {
        setMode(event.newValue);
      }
      // Check for manual flag change (syncing manual state across tabs)
      if (event.key === MANUAL_KEY) {
        setIsManual(event.newValue === "true");
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // --------------------------------------------------------
    // 1.5. Listen for SAME-tab synchronization (Custom Event)
    // --------------------------------------------------------
    const handleLocalThemeChange = (event) => {
      setMode(event.detail.mode);
      setIsManual(event.detail.isManual);
    };
    window.addEventListener('local-theme-change', handleLocalThemeChange);

    // Removed system preference listener as default is always light

    // Cleanup function: remove listeners when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-theme-change', handleLocalThemeChange);
    };
    // Disabling the dependency warning since we only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManual]); // isManual is now a dependency to ensure we use the latest value in the listener

  const toggleMode = () => {
    setLoading(true);
    // 💡 When the user toggles, mark it as a manual choice
    setIsManual(true);
    setMode(prev => {
      const newMode = prev === "light" ? "dark" : "light";
      
      // Dispatch custom event to sync other instances in the SAME tab
      window.dispatchEvent(new CustomEvent('local-theme-change', { 
        detail: { mode: newMode, isManual: true } 
      }));
      
      return newMode;
    });
  };

  return { mode, toggleMode, loading };
}