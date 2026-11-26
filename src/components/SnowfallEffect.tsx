import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
  tint: string;
}

const SNOW_TINTS = [
  "255, 255, 255",
  "255, 250, 245",
  "245, 232, 236", // subtle warm rose-white to blend with AromaWrap's palette
];

/**
 * Lightweight festive snowfall overlay for the storefront.
 * Skips /admin and /experience/* pages and respects prefers-reduced-motion.
 */
export const SnowfallEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { pathname } = useLocation();

  const shouldSkip =
    pathname.startsWith("/admin") || pathname.startsWith("/experience");

  useEffect(() => {
    if (shouldSkip) return;
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (reducedMotion?.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const flakeCount = width < 640 ? 32 : width < 1024 ? 48 : 65;
    const flakes: Snowflake[] = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.4 + Math.random() * 2.8,
      speedY: 0.45 + Math.random() * 0.95,
      speedX: (Math.random() - 0.5) * 0.35,
      opacity: 0.35 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.008 + Math.random() * 0.015,
      tint: SNOW_TINTS[Math.floor(Math.random() * SNOW_TINTS.length)],
    }));

    let rafId = 0;
    let paused = document.hidden;

    const onVisibilityChange = () => {
      paused = document.hidden;
    };

    const draw = () => {
      if (!paused) {
        ctx.clearRect(0, 0, width, height);

        for (const flake of flakes) {
          flake.wobble += flake.wobbleSpeed;
          flake.y += flake.speedY;
          flake.x += flake.speedX + Math.sin(flake.wobble) * 0.35;

          if (flake.y > height + 8) {
            flake.y = -8;
            flake.x = Math.random() * width;
          }
          if (flake.x > width + 8) flake.x = -8;
          if (flake.x < -8) flake.x = width + 8;

          const grad = ctx.createRadialGradient(
            flake.x,
            flake.y,
            0,
            flake.x,
            flake.y,
            flake.radius * 1.8
          );
          grad.addColorStop(0, `rgba(${flake.tint}, ${flake.opacity})`);
          grad.addColorStop(1, `rgba(${flake.tint}, 0)`);

          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(flake.x, flake.y, flake.radius * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = window.requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    rafId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [shouldSkip]);

  if (shouldSkip) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
};
