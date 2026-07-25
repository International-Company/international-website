"use client";

import { useEffect, useState } from "react";

export default function Preloader({
  brandEn,
  brandAr,
}: {
  brandEn: string;
  brandAr: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`preloader${done ? " done" : ""}`} aria-hidden>
      <div className="pl-word">{brandEn}</div>
      <div className="pl-ar">{brandAr}</div>
      <div className="pl-line" />
    </div>
  );
}
