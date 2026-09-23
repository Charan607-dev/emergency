import React, { useRef, useEffect } from 'react';

/**
 * KineticGrid Component (SatoriUI spec)
 * Interactive, full-screen canvas background featuring a warping dot grid
 * that bends toward the cursor on hover and ripples outward when clicked.
 */
export function KineticGrid({
  children,
  className = '',
  dotColor = '#38bdf8',
  glowColor = '#818cf8',
  backgroundColor = '#0b0f19',
  gridGap = 32,
  dotRadius = 1.5,
  interactionRadius = 160,
  maxDisplacement = 35,
  damping = 0.92,
  springConstant = 0.05,
  ...props
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const ripplesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let points = [];
    let width = 0;
    let height = 0;

    const initPoints = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      points = [];

      const cols = Math.ceil(width / gridGap) + 1;
      const rows = Math.ceil(height / gridGap) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const ox = i * gridGap;
          const oy = j * gridGap;
          points.push({
            originX: ox,
            originY: oy,
            x: ox,
            y: oy,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    initPoints();

    const handleResize = () => {
      initPoints();
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const handleClick = (e) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.45,
        speed: 10,
        strength: 25,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    const animate = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update ripples
      const activeRipples = ripplesRef.current;
      for (let r = activeRipples.length - 1; r >= 0; r--) {
        const rip = activeRipples[r];
        rip.radius += rip.speed;
        if (rip.radius > rip.maxRadius) {
          activeRipples.splice(r, 1);
        }
      }

      // Update and draw points
      for (let p of points) {
        // Distance to cursor
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let forceX = 0;
        let forceY = 0;

        // Attract / bend toward cursor if within interactionRadius
        if (dist < interactionRadius && dist > 0) {
          const power = (1 - dist / interactionRadius) * maxDisplacement;
          const angle = Math.atan2(dy, dx);
          forceX += Math.cos(angle) * power;
          forceY += Math.sin(angle) * power;
        }

        // Ripple reaction
        for (let rip of activeRipples) {
          const rdx = p.x - rip.x;
          const rdy = p.y - rip.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const diff = Math.abs(rdist - rip.radius);

          if (diff < 40 && rdist > 0) {
            const rippleFactor = (1 - diff / 40) * rip.strength;
            const rAngle = Math.atan2(rdy, rdx);
            forceX += Math.cos(rAngle) * rippleFactor;
            forceY += Math.sin(rAngle) * rippleFactor;
          }
        }

        // Spring back to origin
        const springX = (p.originX - p.x) * springConstant;
        const springY = (p.originY - p.y) * springConstant;

        p.vx = (p.vx + springX + forceX * 0.1) * damping;
        p.vy = (p.vy + springY + forceY * 0.1) * damping;

        p.x += p.vx;
        p.y += p.vy;

        // Draw dot with dynamic luminescence
        const activity = Math.min(1, Math.sqrt(p.vx * p.vx + p.vy * p.vy) / 4);
        const radius = dotRadius + activity * 1.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

        if (activity > 0.2) {
          ctx.fillStyle = glowColor;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = dotColor;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [
    backgroundColor,
    dotColor,
    glowColor,
    gridGap,
    dotRadius,
    interactionRadius,
    maxDisplacement,
    damping,
    springConstant,
  ]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100%',
        backgroundColor,
        overflow: 'hidden',
      }}
      className={className}
      {...props}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {children}
      </div>
    </div>
  );
}

export default KineticGrid;
