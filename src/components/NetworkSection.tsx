"use client";

import { useEffect, useRef } from "react";
import type { Dict } from "@/dictionaries";
import Reveal from "./Reveal";

const NODES = [
  { x: 0.12, y: 0.44 }, { x: 0.2, y: 0.28 }, { x: 0.26, y: 0.3 }, { x: 0.33, y: 0.52 },
  { x: 0.4, y: 0.24 }, { x: 0.46, y: 0.38 }, { x: 0.52, y: 0.3 }, { x: 0.57, y: 0.58 },
  { x: 0.64, y: 0.42 }, { x: 0.68, y: 0.26 }, { x: 0.74, y: 0.5 }, { x: 0.8, y: 0.66 },
  { x: 0.86, y: 0.36 }, { x: 0.9, y: 0.55 },
];
const HUB = { x: 0.5, y: 0.62 };

export default function NetworkSection({ dict }: { dict: Dict }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let visible = false;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const ink = (a: number) =>
      document.documentElement.getAttribute("data-theme") === "light"
        ? `rgba(37,99,235,${a})`
        : `rgba(96,165,250,${a})`;

    const q = (
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      t: number
    ) => {
      const u = 1 - t;
      return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
      };
    };

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      const hub = { x: HUB.x * W, y: HUB.y * H };

      NODES.forEach((n, i) => {
        const np = { x: n.x * W, y: n.y * H };
        const ctrl = { x: (hub.x + np.x) / 2, y: Math.min(hub.y, np.y) - H * 0.22 };

        ctx.beginPath();
        ctx.moveTo(hub.x, hub.y);
        ctx.quadraticCurveTo(ctrl.x, ctrl.y, np.x, np.y);
        ctx.strokeStyle = ink(0.1);
        ctx.lineWidth = 1;
        ctx.stroke();

        const t = (time * 0.00012 + i * 0.13) % 1;
        const pos = q(hub, ctrl, np, t);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.9);
        ctx.fill();

        const tr = q(hub, ctrl, np, Math.max(0, t - 0.04));
        ctx.beginPath();
        ctx.moveTo(tr.x, tr.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = ink(0.35);
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(np.x, np.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.75);
        ctx.fill();
        const pt = (time * 0.0005 + i * 0.37) % 1;
        ctx.beginPath();
        ctx.arc(np.x, np.y, 3 + pt * 16, 0, Math.PI * 2);
        ctx.strokeStyle = ink(0.28 * (1 - pt));
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = ink(1);
      ctx.fill();
      const hp = (time * 0.0006) % 1;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 5 + hp * 26, 0, Math.PI * 2);
      ctx.strokeStyle = ink(0.4 * (1 - hp));
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (visible = e.isIntersecting)),
      { threshold: 0.1 }
    );
    io.observe(section);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section className="network" id="network" ref={sectionRef}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-tag center">{dict.network.tag}</div>
          <h2 className="section-title">{dict.network.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub" style={{ margin: "0 auto" }}>{dict.network.sub}</p>
        </Reveal>
      </div>
      <div className="net-stage">
        <canvas ref={canvasRef} className="net-canvas" />
        {dict.network.cities.map((c) => (
          <div
            key={c.en}
            className="city-chip"
            style={{ top: c.top, insetInlineStart: c.start, animationDelay: c.delay }}
          >
            <b>{c.ar}</b> · {c.en}
          </div>
        ))}
      </div>
    </section>
  );
}
