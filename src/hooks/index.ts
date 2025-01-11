import { useState, useEffect } from "react";

export const useDarkMode = (initialValue: boolean) => {
  const [value, setValue] = useState(() => {
    const userMode = window.matchMedia("(prefers-color-scheme:dark)").matches; //If user has darkmode set on system

    if (userMode) {
      return true;
    }

    let darkMode = window.localStorage.getItem("darkMode");

    if (darkMode !== null) {
      return Boolean(JSON.parse(darkMode));
    }

    return initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem("darkMode", JSON.stringify(value));
  }, [value]);

  return [value, setValue] as const;
};
