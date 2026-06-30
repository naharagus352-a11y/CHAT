import React, { useRef, useEffect } from "react";

export default function FallingStarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Deep background stars (stay relatively stationary, twinkling slowly)
    const numStars = 110;
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.7 + 0.3,
        fadeSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    // Continuous falling dots (acting as continuous falling stars)
    const numFallingStars = 25;
    const fallingStars: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      tailLength: number;
    }> = [];

    for (let i = 0; i < numFallingStars; i++) {
      fallingStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.8,
        speedY: Math.random() * 2.2 + 1.2, // Continuous downward velocity
        speedX: Math.random() * 0.4 - 0.2, // Subtle horizontal drift
        opacity: Math.random() * 0.5 + 0.4,
        tailLength: Math.random() * 5 + 3,
      });
    }

    // Rare, high-velocity cinematic shooting stars with color glows
    const shootingStars: Array<{
      x: number;
      y: number;
      dx: number;
      dy: number;
      length: number;
      speed: number;
      opacity: number;
      color: string;
    }> = [];

    const createShootingStar = () => {
      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.4);
      // Falling angle: steep downwards and slightly right/left
      const angle = Math.PI / 3 + (Math.random() * 0.3 - 0.15); 
      const speed = Math.random() * 14 + 10;
      
      shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: Math.random() * 70 + 40,
        speed: speed,
        opacity: 1,
        color: Math.random() > 0.5 ? "rgba(6, 182, 212, " : "rgba(99, 102, 241, ", // glowing cyan or indigo
      });
    };

    // Resize listener
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      // Clear with pitch black backplate
      ctx.fillStyle = "#020617"; // Slate 950 deep base for beautiful depth, or absolute black #000000
      ctx.fillRect(0, 0, width, height);

      // 1. Render stationary twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        star.opacity += star.fadeSpeed;
        if (star.opacity > 1 || star.opacity < 0.15) {
          star.fadeSpeed = -star.fadeSpeed;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, star.opacity))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render continuous falling star dots
      for (let i = 0; i < fallingStars.length; i++) {
        const fStar = fallingStars[i];
        fStar.y += fStar.speedY;
        fStar.x += fStar.speedX;

        // Wrap around when reaching screen boundaries
        if (fStar.y > height) {
          fStar.y = -10;
          fStar.x = Math.random() * width;
          fStar.speedY = Math.random() * 2.2 + 1.2;
        }
        if (fStar.x < -10 || fStar.x > width + 10) {
          fStar.x = Math.random() * width;
        }

        // Star dot
        ctx.fillStyle = `rgba(255, 255, 255, ${fStar.opacity})`;
        ctx.beginPath();
        ctx.arc(fStar.x, fStar.y, fStar.size, 0, Math.PI * 2);
        ctx.fill();

        // Star dot trailing effect
        const grad = ctx.createLinearGradient(
          fStar.x,
          fStar.y,
          fStar.x - fStar.speedX * fStar.tailLength,
          fStar.y - fStar.speedY * fStar.tailLength
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${fStar.opacity * 0.65})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = fStar.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(fStar.x, fStar.y);
        ctx.lineTo(fStar.x - fStar.speedX * fStar.tailLength, fStar.y - fStar.speedY * fStar.tailLength);
        ctx.stroke();
      }

      // 3. Spawning & rendering fast dramatic shooting stars
      if (Math.random() < 0.008) {
        createShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.dx;
        ss.y += ss.dy;
        ss.opacity -= 0.025; // fade out speed

        if (ss.opacity <= 0 || ss.x > width || ss.y > height || ss.x < 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.dx * 1.3, ss.y - ss.dy * 1.3);
        grad.addColorStop(0, `${ss.color}${ss.opacity})`);
        grad.addColorStop(0.2, `${ss.color}${ss.opacity * 0.8})`);
        grad.addColorStop(1, `${ss.color}0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.dx * 1.3, ss.y - ss.dy * 1.3);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="falling-stars-canvas"
      className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0 bg-black"
    />
  );
}
