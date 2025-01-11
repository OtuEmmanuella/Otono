import React, { useEffect } from "react";
import { ReactComponent as Sun } from "../assets/sun.svg";
import { ReactComponent as Moon } from "../assets/moon.svg";
import { useDarkMode } from "../hooks";

export const ToggleButton: React.FC = () => {
  const [toggle, setToggle] = useDarkMode(false);

  useEffect(() => {
    if (toggle) {
      document.querySelector("body")?.setAttribute("data-theme", "dark");
    }

    return () => {
      document.querySelector("body")?.removeAttribute("data-theme");
    };
  }, [toggle]);

  return (
    <button
      type="button"
      data-type="toggle"
      role="switch"
      aria-label="dark mode"
      aria-checked={toggle}
      onClick={() => setToggle((toggle) => !toggle)}
    >
      <span>
        <Sun />
      </span>
      <div className="toggle__thumb" data-toggle={toggle}></div>
      <span>
        <Moon />
      </span>
    </button>
  );
};
