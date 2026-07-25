"use client";

import { useEffect, useRef } from "react";

/** Custom cursor ring + magnetic buttons (desktop pointers only). */
export default function CursorFx() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ring = ringRef.current;
    if (!ring) return;

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      ring.classList.add("on");
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      raf = requestAnimationFrame(loop);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, .gold-card, .svc-list li, .svc-card")) {
        ring.classList.add("hovering");
      } else {
        ring.classList.remove("hovering");
      }
    };

    // Magnetic buttons
    const onMagMove = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>(".magnetic");
      document.querySelectorAll<HTMLElement>(".magnetic").forEach((b) => {
        if (b !== btn) b.style.transform = "";
      });
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousemove", onMagMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousemove", onMagMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ringRef} className="cursor-ring" aria-hidden />;
}
