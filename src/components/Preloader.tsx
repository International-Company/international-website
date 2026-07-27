"use client";

import { useEffect, useState } from "react";

export default function Preloader({
  brandEn,
  brandAr,
  arOnly = false,
}: {
  brandEn: string;
  brandAr: string;
  arOnly?: boolean;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // cinematic intro once per session — skip on subsequent page loads
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
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`preloader${done ? " done" : ""}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.png" alt="" className="pl-logo" />
      {!arOnly && <div className="pl-word">{brandEn}</div>}
      <div className={`pl-ar${arOnly ? " pl-ar-solo" : ""}`}>{brandAr}</div>
      <div className="pl-line" />
    </div>
  );
}
