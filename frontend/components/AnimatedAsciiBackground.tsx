"use client";

import React, { useEffect, useRef } from "react";

// ASCII Character sets arranged by visual weight/density
const CHAR_SET = [".", ":", "-", "+", "=", "/", "\\", "<", ">", "*", "0", "1", "A", "N", "O", "R", "S", "M"];

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  charIndex: number;
  depth: number; // 0: background (faint), 1: midground, 2: foreground (bright)
  seed: number;
}

export default function AnimatedAsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Grid configuration based on screen width
    let gridStep = width < 768 ? 32 : width < 1200 ? 24 : 18;
    let particles: Particle[] = [];

    const initGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gridStep = width < 768 ? 32 : width < 1200 ? 24 : 18;
      particles = [];

      const cols = Math.ceil(width / gridStep) + 2;
      const rows = Math.ceil(height / gridStep) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gridStep;
          const y = r * gridStep;
          const seed = Math.random() * 1000;

          // Assign depth randomly: 60% bg, 30% mid, 10% fg
          const randDepth = Math.random();
          const depth = randDepth > 0.9 ? 2 : randDepth > 0.6 ? 1 : 0;
          const charIndex = Math.floor(Math.random() * CHAR_SET.length);

          particles.push({
            baseX: x,
            baseY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            charIndex,
            depth,
            seed,
          });
        }
      }
    };

    initGrid();

    const handleResize = () => {
      initGrid();
    };

    window.addEventListener("resize", handleResize);

    let time = 0;

    const render = () => {
      time += reducedMotion ? 0.002 : 0.008;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, width, height);

      // Set Font style
      ctx.font = `${Math.max(10, Math.floor(gridStep * 0.65))}px "Courier New", Courier, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const mouseRadius = 160;
      const mouseRadiusSq = mouseRadius * mouseRadius;

      // Theme detection for particle colors
      const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      const baseRgb = isDark ? "242, 240, 234" : "20, 20, 20";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Trigonometric wave displacement field (organic fluid morphing)
        const waveX = Math.sin(p.baseY * 0.008 + time * 1.2 + p.seed) * 12 + Math.cos(p.baseX * 0.005 + time * 0.8) * 8;
        const waveY = Math.cos(p.baseX * 0.008 + time * 1.0 + p.seed) * 12 + Math.sin(p.baseY * 0.006 + time * 0.6) * 8;

        let targetX = p.baseX + waveX;
        let targetY = p.baseY + waveY;

        // Cursor repulsion / interaction force
        const dx = targetX - mouse.x;
        const dy = targetY - mouse.y;
        const distSq = dx * dx + dy * dy;

        let cursorBoost = 0;

        if (distSq < mouseRadiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / mouseRadius) * 28;
          targetX += (dx / dist) * force;
          targetY += (dy / dist) * force;
          cursorBoost = (1 - dist / mouseRadius) * 0.45;
        }

        // Smooth physics position update
        p.x += (targetX - p.x) * 0.1;
        p.y += (targetY - p.y) * 0.1;

        // Calculate organic character index shift over time
        const densityFactor = (Math.sin(p.x * 0.006 + p.y * 0.006 + time * 0.5) + 1) * 0.5;
        const dynamicIndex = Math.floor((p.seed + densityFactor * CHAR_SET.length + time * 2) % CHAR_SET.length);
        const char = CHAR_SET[dynamicIndex];

        // Calculate opacity based on depth & cursor proximity
        let opacity = 0.08;
        if (p.depth === 1) opacity = 0.22;
        if (p.depth === 2) opacity = 0.45;

        opacity = Math.min(0.85, opacity + cursorBoost + densityFactor * 0.20);
        const finalAlpha = isDark ? (opacity * 0.45).toFixed(2) : (opacity * 0.35).toFixed(2);

        // Render character with theme-aware color
        ctx.fillStyle = `rgba(${baseRgb}, ${finalAlpha})`;
        ctx.fillText(char, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none w-full h-full block bg-transparent"
    />
  );
}
