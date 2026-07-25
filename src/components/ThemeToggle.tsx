"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light") setTheme("light");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("intl-theme", next);
    } catch {}
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      <span className="knob">{theme === "light" ? "☀" : "☾"}</span>
    </button>
  );
}
