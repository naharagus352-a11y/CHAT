import { useRef, useEffect } from "react";

export default function LoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Star field configuration
    const numStars = 120;
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
    }> = [];

    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(191, 219, 254, ", // light blue
      "rgba(165, 180, 252, ", // light indigo
      "rgba(207, 250, 254, ", // light cyan
    ];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        fadeSpeed: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // Comet / Meteor configuration
    interface Comet {
      x: number;
      y: number;
      dx: number;
      dy: number;
      size: number;
      length: number;
      speed: number;
      opacity: number;
      color: string;
      sparkles: Array<{
        x: number;
        y: number;
        size: number;
        opacity: number;
        dx: number;
        dy: number;
      }>;
    }

    const comets: Comet[] = [];

    const createComet = () => {
      const startX = Math.random() * (width * 1.2); // can spawn slightly offscreen right
      const startY = -50; // spawn above screen
      
      // Comets fall diagonally from top-right to bottom-left
      const angle = Math.PI * 0.75 + (Math.random() * 0.15 - 0.075); // ~135 degrees diagonal
      const speed = Math.random() * 9 + 6; // fast moving
      
      const colors = [
        "rgba(6, 182, 212, ",   // cyan glow
        "rgba(14, 165, 233, ",  // sky blue glow
        "rgba(99, 102, 241, ",  // indigo glow
        "rgba(244, 63, 94, ",   // rose glow
        "rgba(245, 158, 11, ",  // amber glow
      ];

      comets.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1.2,
        length: Math.random() * 160 + 90,
        speed: speed,
        opacity: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        sparkles: [],
      });
    };

    // Nebula background clouds
    const nebulae: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
    }> = [];

    const generateNebulae = (w: number, h: number) => {
      nebulae.length = 0;
      nebulae.push(
        { x: w * 0.2, y: h * 0.3, radius: Math.min(w, h) * 0.4, color: "rgba(99, 102, 241, 0.03)" }, // indigo
        { x: w * 0.8, y: h * 0.2, radius: Math.min(w, h) * 0.35, color: "rgba(6, 182, 212, 0.03)" },  // cyan
        { x: w * 0.5, y: h * 0.7, radius: Math.min(w, h) * 0.5, color: "rgba(244, 63, 94, 0.02)" }   // rose
      );
    };
    generateNebulae(width, height);

    // Floating Saturn Planet Configuration
    let saturnX = width * 0.75;
    let saturnY = height * 0.4;
    let baseSaturnY = height * 0.4;
    let saturnRadius = Math.max(100, Math.min(200, Math.min(width, height) * 0.16));

    const updateSaturnPosition = (w: number, h: number) => {
      // Adjust position based on screen width (shift more center on smaller screens)
      if (w < 768) {
        saturnX = w * 0.5;
        baseSaturnY = h * 0.25;
      } else {
        saturnX = w * 0.78;
        baseSaturnY = h * 0.45;
      }
      saturnRadius = Math.max(110, Math.min(220, Math.min(w, h) * 0.18));
    };
    updateSaturnPosition(width, height);

    // Resize listener
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateNebulae(width, height);
      updateSaturnPosition(width, height);
    };
    window.addEventListener("resize", handleResize);

    let time = 0;

    // Animation loop
    const animate = () => {
      time += 1;

      // 1. Cosmic Deep Space Background (with subtle gradients)
      ctx.fillStyle = "#020617"; // Rich slate-950 deep space base
      ctx.fillRect(0, 0, width, height);

      // Render nebulas
      nebulae.forEach((neb) => {
        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Render and Twinkle Stationary Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.opacity += star.fadeSpeed;
        if (star.opacity > 1.0 || star.opacity < 0.15) {
          star.fadeSpeed = -star.fadeSpeed;
        }

        ctx.fillStyle = `${star.color}${Math.max(0.1, Math.min(1.0, star.opacity))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle core twinkle flare for larger stars
        if (star.size > 1.2 && star.opacity > 0.8) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 2, star.y);
          ctx.lineTo(star.x + star.size * 2, star.y);
          ctx.moveTo(star.x, star.y - star.size * 2);
          ctx.lineTo(star.x, star.y + star.size * 2);
          ctx.stroke();
        }
      }

      // 3. Spawning & Rendering Comets
      // Spawn comet occasionally - heavy meteor rain!
      if (Math.random() < 0.08) {
        createComet();
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        comet.x += comet.dx;
        comet.y += comet.dy;
        comet.opacity -= 0.008; // gradual fadeout

        // Remove out-of-bounds or faded comets
        if (comet.opacity <= 0 || comet.x < -150 || comet.y > height + 150) {
          comets.splice(i, 1);
          continue;
        }

        // Add sparkles/dust particles trailing from comet head
        if (Math.random() < 0.4) {
          comet.sparkles.push({
            x: comet.x,
            y: comet.y,
            size: Math.random() * 1.5 + 0.5,
            opacity: comet.opacity * 0.8,
            dx: -comet.dx * 0.1 + (Math.random() * 1 - 0.5),
            dy: -comet.dy * 0.1 + (Math.random() * 1 - 0.5),
          });
        }

        // Draw sparkles
        for (let j = comet.sparkles.length - 1; j >= 0; j--) {
          const sp = comet.sparkles[j];
          sp.x += sp.dx;
          sp.y += sp.dy;
          sp.opacity -= 0.03;
          if (sp.opacity <= 0) {
            comet.sparkles.splice(j, 1);
            continue;
          }
          ctx.fillStyle = `${comet.color}${sp.opacity})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw glowing comet trail (gradient from glowing white to transparent theme color)
        const trailGrad = ctx.createLinearGradient(
          comet.x,
          comet.y,
          comet.x - comet.dx * (comet.length / comet.speed),
          comet.y - comet.dy * (comet.length / comet.speed)
        );
        trailGrad.addColorStop(0, `rgba(255, 255, 255, ${comet.opacity})`);
        trailGrad.addColorStop(0.1, `${comet.color}${comet.opacity * 0.95})`);
        trailGrad.addColorStop(0.4, `${comet.color}${comet.opacity * 0.5})`);
        trailGrad.addColorStop(1, `${comet.color}0)`);

        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = comet.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(
          comet.x - comet.dx * (comet.length / comet.speed),
          comet.y - comet.dy * (comet.length / comet.speed)
        );
        ctx.stroke();

        // Draw comet bright core nucleus
        ctx.fillStyle = `rgba(255, 255, 255, ${comet.opacity})`;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.size * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Add visual flare aura on the nucleus
        const coreGlow = ctx.createRadialGradient(
          comet.x,
          comet.y,
          0,
          comet.x,
          comet.y,
          comet.size * 4
        );
        coreGlow.addColorStop(0, `${comet.color}${comet.opacity * 0.5})`);
        coreGlow.addColorStop(1, `${comet.color}0)`);
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.size * 4, 0, Math.PI * 2);
        ctx.fill();
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
      id="login-space-canvas"
      className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0 bg-black"
    />
  );
}
