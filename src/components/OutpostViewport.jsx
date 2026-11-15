import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useMission } from '../store/useMission.js';
import { useReducedMotion } from './ui/useReducedMotion.js';
import './OutpostViewport.css';

const STAR_POSITIONS = [
  [88, 98], [206, 166], [350, 78], [488, 190], [628, 92], [764, 150],
  [932, 76], [1088, 177], [1246, 90], [1444, 164], [1518, 72], [132, 250],
  [438, 285], [1042, 270], [1408, 302], [288, 220], [1176, 225], [690, 54],
];
const DUST_POSITIONS = Array.from({ length: 18 }, (_, index) => ({
  x: (index * 97) % 1600,
  y: 430 + ((index * 47) % 170),
  radius: 2 + (index % 4),
}));

function CrewWindow({ member, x }) {
  const mood = member?.mood || 'ok';
  return (
    <g transform={`translate(${x} 443)`}>
      <rect x="-37" y="-49" width="74" height="96" rx="34" fill="#172642" stroke="#9AA6D1" strokeWidth="5" />
      <circle cy="-3" r="25" fill={mood === 'worried' ? '#FFC5D9' : '#F6D6B8'} />
      <circle cx="-8" cy="-8" r="2.7" fill="#172642" />
      <circle cx="8" cy="-8" r="2.7" fill="#172642" />
      {mood === 'happy' && <path d="M-9 4 Q0 15 9 4" fill="none" stroke="#172642" strokeWidth="3" strokeLinecap="round" />}
      {mood === 'worried' && <path d="M-9 11 Q0 2 9 11" fill="none" stroke="#172642" strokeWidth="3" strokeLinecap="round" />}
      {mood === 'ok' && <path d="M-7 8h14" fill="none" stroke="#172642" strokeWidth="3" strokeLinecap="round" />}
      <title>{member?.name || 'Crew member'} is {mood}</title>
    </g>
  );
}

export default function OutpostViewport() {
  const site = useMission((state) => state.config.site);
  const gauges = useMission((state) => state.gauges);
  const sunlight = useMission((state) => state.sunlight);
  const dust = useMission((state) => state.dust);
  const crew = useMission((state) => state.crew);
  const event = useMission((state) => state.event);
  const step = useMission((state) => state.step);
  const reducedMotion = useReducedMotion();
  const phase = useMotionValue(0);
  const sunFloat = useTransform(phase, (time) => Math.sin(time * 0.7) * 4);
  const dustDrift = useTransform(phase, (time) => -((time * 20) % 1600));
  const flareSweep = useTransform(phase, (time) => -360 + ((time * 145) % 2200));
  const beaconGlow = useTransform(phase, (time) => 0.55 + (Math.sin(time * 2.2) + 1) * 0.2);
  const rippleScale = useTransform(phase, (time) => 1 + ((time * 0.35) % 0.24));
  const rippleOpacity = useTransform(phase, (time) => 0.5 * (1 - ((time * 0.35) % 1)));
  const meteorProgress = useTransform(phase, (time) => (time % 3.2) / 3.2);
  const meteorX = useTransform(meteorProgress, (progress) => (
    progress < 0.72 ? 1020 - progress * 300 : 804 + (progress - 0.72) * 90
  ));
  const meteorY = useTransform(meteorProgress, (progress) => (
    progress < 0.72 ? 160 + progress * 470 : 498 - (progress - 0.72) * 360
  ));
  const alarm = Object.values(gauges).some((value) => value < 25);
  const eventActive = Boolean(event && step === 'event');
  const moon = site === 'moon';
  const sunLevel = Math.min(1, Math.max(0, sunlight));
  const dustLevel = Math.min(1, Math.max(0, dust));
  const sunHeight = 325 - sunLevel * 190;
  const panelTilt = (sunLevel - 0.5) * 16;
  const bubbleOpacity = 0.08 + (Math.min(100, Math.max(0, gauges.shield)) / 100) * 0.3;
  const batteryWidth = (Math.min(100, Math.max(0, gauges.power)) / 100) * 76;

  useEffect(() => {
    if (reducedMotion) {
      phase.set(0);
      return undefined;
    }
    let frame = 0;
    const tick = (time) => {
      if (document.hidden) return;
      phase.set(time / 1000);
      frame = window.requestAnimationFrame(tick);
    };
    const onVisibilityChange = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden) frame = window.requestAnimationFrame(tick);
    };
    if (!document.hidden) frame = window.requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [phase, reducedMotion]);

  return (
    <figure className="outpost-viewport">
      <svg
        viewBox="0 0 1600 900"
        role="img"
        aria-labelledby="outpost-title outpost-description"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="outpost-title">{moon ? 'Moon' : 'Mars'} outpost</title>
        <desc id="outpost-description">
          A habitat with crew windows, solar panels, a shield bubble, and a power meter.
          {alarm ? ' Alert: a gauge is low.' : ''}
        </desc>
        <defs>
          <linearGradient id="moon-sky" x2="0" y2="1">
            <stop stopColor="#050813" />
            <stop offset="1" stopColor="#202A42" />
          </linearGradient>
          <linearGradient id="mars-sky" x2="0" y2="1">
            <stop stopColor="#8B536B" />
            <stop offset="0.62" stopColor="#D38A84" />
            <stop offset="1" stopColor="#E7AA82" />
          </linearGradient>
          <linearGradient id="moon-ground" x2="0" y2="1">
            <stop stopColor="#8B91A0" />
            <stop offset="1" stopColor="#424958" />
          </linearGradient>
          <linearGradient id="mars-ground" x2="0" y2="1">
            <stop stopColor="#D5A05F" />
            <stop offset="1" stopColor="#9C603B" />
          </linearGradient>
          <linearGradient id="flare-sweep">
            <stop stopColor="#FF5FA2" stopOpacity="0" />
            <stop offset="0.48" stopColor="#FFD23F" stopOpacity="0.42" />
            <stop offset="1" stopColor="#FF5FA2" stopOpacity="0" />
          </linearGradient>
          <pattern id="shield-hex" width="54" height="48" patternUnits="userSpaceOnUse">
            <path d="m14 2 12 7v14l-12 7-12-7V9Zm27 0 12 7v14l-12 7-12-7V9Z" fill="none" stroke="#B9F5FF" strokeOpacity="0.58" strokeWidth="2" />
          </pattern>
          <filter id="soft-shield-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="13" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="1600" height="900" fill={moon ? 'url(#moon-sky)' : 'url(#mars-sky)'} />
        {moon ? (
          <>
            {STAR_POSITIONS.map(([x, y], index) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={index % 3 ? 2 : 3} fill="#F5F7FF" opacity={0.45 + (index % 4) * 0.12} />
            ))}
            <g aria-hidden="true">
              <circle cx="1370" cy="170" r="80" fill="#D9F0FF" />
              <path d="M1315 150q35-24 51 5t58 11q-9 55-68 69t-73-44q18-20 32-41Z" fill="#7AB8D9" />
              <circle cx="1370" cy="170" r="80" fill="none" stroke="#F5F7FF" strokeOpacity="0.5" strokeWidth="5" />
            </g>
          </>
        ) : (
          <>
            <rect width="1600" height="520" fill="#F29C9E" opacity={0.08 + dustLevel * 0.25} />
            <path d="M0 460Q390 390 800 458t800-5v120H0Z" fill="#F6C1AE" opacity={0.16 + dustLevel * 0.28} />
          </>
        )}

        <motion.g style={{ y: sunFloat }} opacity={0.28 + sunLevel * 0.72}>
          <circle cx="260" cy={sunHeight} r="92" fill="#FFD23F" opacity="0.15" />
          <circle cx="260" cy={sunHeight} r="54" fill={moon ? '#F5F7FF' : '#FFE58A'} />
          <circle cx="260" cy={sunHeight} r="37" fill="#FFF6C5" opacity={0.55} />
        </motion.g>

        {!moon && (
          <motion.g style={{ x: dustDrift }} opacity={dustLevel * 0.88} aria-hidden="true">
            {[0, 1600].map((offset) => (
              <g key={offset} transform={`translate(${offset} 0)`}>
                {DUST_POSITIONS.map((particle, index) => (
                  <circle
                    key={index}
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.radius}
                    fill="#F7C390"
                    opacity={0.35 + (index % 5) * 0.1}
                  />
                ))}
              </g>
            ))}
          </motion.g>
        )}

        <path
          d="M0 625q180-53 340-5t310-14q190-51 355 6t330-1q155-36 265 6v283H0Z"
          fill={moon ? 'url(#moon-ground)' : 'url(#mars-ground)'}
        />
        <g fill={moon ? '#343B4B' : '#915A3B'} opacity="0.58">
          <ellipse cx="180" cy="694" rx="92" ry="22" />
          <ellipse cx="1315" cy="677" rx="126" ry="26" />
          <ellipse cx="420" cy="833" rx="150" ry="32" />
        </g>
        <g fill="none" stroke={moon ? '#B2B7C1' : '#E5B178'} strokeWidth="8" opacity="0.42">
          <ellipse cx="180" cy="687" rx="48" ry="12" />
          <ellipse cx="1315" cy="670" rx="66" ry="17" />
        </g>

        <g>
          <path d="M550 544 360 492" stroke="#D4DDF2" strokeWidth="12" />
          <path d="M1050 544 1240 492" stroke="#D4DDF2" strokeWidth="12" />
        </g>
        <motion.g style={{ rotate: panelTilt, transformBox: 'fill-box', transformOrigin: '50% 50%' }}>
          <g stroke="#B4F5FF" strokeWidth="4">
            <rect x="190" y="426" width="190" height="122" rx="8" fill="#17627E" />
            <path d="M238 426v122m48-122v122m47-122v122M190 467h190m-190 42h190" />
          </g>
        </motion.g>
        <motion.g style={{ rotate: -panelTilt, transformBox: 'fill-box', transformOrigin: '50% 50%' }}>
          <g stroke="#B4F5FF" strokeWidth="4">
            <rect x="1220" y="426" width="190" height="122" rx="8" fill="#17627E" />
            <path d="M1268 426v122m48-122v122m47-122v122m-143-81h190m-190 42h190" />
          </g>
        </motion.g>

        <rect x="500" y="592" width="600" height="92" rx="22" fill="#252D46" stroke="#D9E1F7" strokeWidth="8" />
        <path d="M580 592V495c0-124 99-214 220-214s220 90 220 214v97Z" fill="#91BDE2" fillOpacity="0.22" stroke="#E8F4FF" strokeWidth="10" />
        <motion.path
          d="M474 624V496c0-153 136-257 326-257s326 104 326 257v128Z"
          fill="url(#shield-hex)"
          stroke="#A8F2FF"
          strokeWidth="8"
          filter="url(#soft-shield-glow)"
          style={{ opacity: bubbleOpacity }}
        />
        <path d="M580 592V495c0-124 99-214 220-214s220 90 220 214v97Z" fill="url(#shield-hex)" fillOpacity="0.52" />

        {crew.slice(0, 3).map((member, index) => (
          <CrewWindow key={member.id || index} member={member} x={700 + index * 100} />
        ))}

        <g transform="translate(967 610)">
          <rect width="94" height="34" rx="10" fill="#0B1020" stroke="#9AA6D1" strokeWidth="4" />
          <rect x="7" y="7" width={batteryWidth} height="20" rx="6" fill="#22D3EE" />
          <text x="47" y="61" fill="#F5F7FF" fontSize="21" fontWeight="700" textAnchor="middle">
            Power {Math.round(gauges.power)}%
          </text>
        </g>

        <motion.g style={{ opacity: alarm ? beaconGlow : 0.4 }}>
          <circle cx="800" cy="250" r="38" fill={alarm ? '#FF5FA2' : '#7CFF6B'} opacity="0.24" />
          <path d="M800 212v-24" stroke={alarm ? '#FF5FA2' : '#7CFF6B'} strokeWidth="12" strokeLinecap="round" />
          <circle cx="800" cy="214" r="14" fill={alarm ? '#FF5FA2' : '#7CFF6B'} />
          <path d={alarm ? 'M800 232v22m0 12v2' : 'm790 245 7 7 14-16'} fill="none" stroke="#0B1020" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <text x="800" y="286" fill="#F5F7FF" fontSize="18" fontWeight="700" textAnchor="middle">
            {alarm ? 'ALERT' : 'ALL OK'}
          </text>
        </motion.g>

        {eventActive && event.kind === 'flare' && (
          <>
            <motion.rect
              x="0"
              y="0"
              width="360"
              height="900"
              fill="url(#flare-sweep)"
              style={{ x: flareSweep, opacity: 0.85 }}
            />
            <motion.g style={{ scale: rippleScale, opacity: rippleOpacity, transformOrigin: '800px 500px' }}>
              <path d="M580 560c28-160 118-245 220-245s192 85 220 245" fill="none" stroke="#FFE28A" strokeWidth="10" />
            </motion.g>
            <motion.g style={{ scale: rippleScale, opacity: rippleOpacity, transformOrigin: '800px 500px' }}>
              <path d="M540 574c38-194 137-295 260-295s222 101 260 295" fill="none" stroke="#FF5FA2" strokeWidth="5" />
            </motion.g>
          </>
        )}
        {eventActive && event.kind === 'dust' && (
          <motion.path
            d="M0 535q220-80 420-10t420-4q220-67 420 0t340-6v132H0Z"
            fill="#F2B590"
            style={{ x: dustDrift, opacity: 0.2 + dustLevel * 0.5 }}
          />
        )}
        {eventActive && event.kind === 'micrometeorite' && (
          <motion.g style={{ x: meteorX, y: meteorY }} aria-hidden="true">
            <path d="m0 0 76-31" stroke="#FFF1C2" strokeWidth="9" strokeLinecap="round" />
            <circle r="10" fill="#FFD23F" />
          </motion.g>
        )}
      </svg>
      <figcaption className="oc-sr-only" aria-live="polite">
        The {moon ? 'Moon' : 'Mars'} outpost. Power is {Math.round(gauges.power)} percent.
        {alarm ? ' Alert: a gauge is low.' : ''}
      </figcaption>
    </figure>
  );
}
