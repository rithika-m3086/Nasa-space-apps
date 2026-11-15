import React from 'react';
import { useEffect, useRef } from 'react';
import { useMission } from '../store/useMission.js';
import { useReducedMotion } from './ui/useReducedMotion.js';

const STARS = Array.from({ length: 80 }, (_, index) => ({
  x: (index * 0.61803398875) % 1,
  y: (index * 0.75487766625) % 1,
  radius: 0.6 + ((index * 17) % 10) / 10,
  phase: (index * 1.7) % (Math.PI * 2),
}));

export default function Starfield() {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const site = useMission((state) => state.config.site);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time = 0) => {
      if (document.hidden) return;
      context.clearRect(0, 0, width, height);
      const haze = context.createLinearGradient(0, 0, 0, height);
      const tint = site === 'mars' ? '255, 179, 138' : '217, 222, 238';
      haze.addColorStop(0, `rgba(${tint}, ${site === 'mars' ? 0.13 : 0.08})`);
      haze.addColorStop(1, `rgba(${tint}, 0)`);
      context.fillStyle = haze;
      context.fillRect(0, 0, width, height);
      STARS.forEach((star, index) => {
        const wave = reducedMotion ? 0 : Math.sin(time / 900 + star.phase);
        context.globalAlpha = 0.42 + (wave + 1) * 0.25;
        context.fillStyle = index % 9 === 0
          ? '#22D3EE'
          : site === 'mars' ? '#FFB38A' : '#D9DEEE';
        context.beginPath();
        context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    const onVisibilityChange = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden) draw(performance.now());
    };
    const onResize = () => {
      resize();
      if (reducedMotion) draw();
    };
    resize();
    draw();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reducedMotion, site]);

  return <canvas ref={canvasRef} className="oc-starfield" aria-hidden="true" />;
}
