"use client";

import { useEffect, useState } from "react";

/** Cinematic splash: logo, company name and tagline — once per session. */
export default function Preloader({
  title,
  tagline,
}: {
  title: string;
  tagline: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("intl-preloaded") === "1";
    } catch {}
    if (seen) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => {
      setDone(true);
      try {
        sessionStorage.setItem("intl-preloaded", "1");
      } catch {}
    }, 2100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`preloader${done ? " done" : ""}`} aria-hidden>
      <div className="pl-stage">
        <div className="pl-mark">
          <span className="pl-ring" />
          <span className="pl-ring pl-ring-2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="" className="pl-logo" />
        </div>

        <h1 className="pl-title">{title}</h1>
        <p className="pl-tagline">{tagline}</p>

        <div className="pl-bar">
          <span />
        </div>
      </div>
    </div>
  );
}
