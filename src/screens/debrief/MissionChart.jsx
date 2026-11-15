import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../../components/ui/index.js';

const SERIES = [
  { key: 'power', name: 'Power', color: 'var(--color-power)', dash: '0', shape: 'circle' },
  { key: 'life', name: 'Life Support', color: 'var(--color-life)', dash: '7 4', shape: 'square' },
  { key: 'shield', name: 'Shield', color: 'var(--color-shield)', dash: '2 4', shape: 'triangle' },
];

function ChartMarker({ cx, cy, stroke, shape, ghost = false }) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  const fill = ghost ? 'var(--color-panel)' : stroke;
  if (shape === 'square') {
    return <rect x={cx - 3.5} y={cy - 3.5} width="7" height="7" fill={fill} stroke={stroke} strokeWidth="2" />;
  }
  if (shape === 'triangle') {
    return <path d={`M ${cx} ${cy - 4.5} L ${cx + 4.5} ${cy + 3.5} L ${cx - 4.5} ${cy + 3.5} Z`} fill={fill} stroke={stroke} strokeWidth="2" />;
  }
  return <circle cx={cx} cy={cy} r="3.5" fill={fill} stroke={stroke} strokeWidth="2" />;
}

export default function MissionChart({ chartData, dayLabel, showGhost, onToggleGhost }) {
  const summary = chartData.length
    ? `Your chart has ${chartData.length} ${dayLabel.toLowerCase()}${chartData.length === 1 ? '' : 's'}. It tracks power, life support, and shield.`
    : 'Your mission chart will appear after your crew records a day.';

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="oc-display text-2xl">Your crew and the Ghost</h2>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-2">
          <input
            type="checkbox"
            checked={showGhost}
            onChange={(event) => onToggleGhost(event.target.checked)}
            className="h-5 w-5 accent-[var(--color-accent)]"
          />
          <span>Show Ghost Flight Director</span>
        </label>
      </div>
      <div className="mt-3 h-72 w-full" role="img" aria-label={`${summary} Dashed gray lines show the Ghost Flight Director's plan.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 5" />
            <XAxis dataKey="day" tickFormatter={(day) => `${dayLabel} ${day}`} stroke="#9AA6D1" />
            <YAxis domain={[0, 100]} stroke="#9AA6D1" width={34} />
            <Tooltip
              contentStyle={{ background: '#151B36', border: '1px solid #49527a', borderRadius: 12 }}
              labelFormatter={(day) => `${dayLabel} ${day}`}
            />
            {SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.name}
                stroke={series.color}
                strokeWidth={3}
                strokeDasharray={series.dash}
                dot={(props) => <ChartMarker {...props} shape={series.shape} />}
                activeDot={false}
              />
            ))}
            {showGhost && SERIES.map((series) => (
              <Line
                key={`ghost-${series.key}`}
                type="monotone"
                dataKey={`ghost${series.key[0].toUpperCase()}${series.key.slice(1)}`}
                name={`Ghost ${series.name}`}
                stroke="#B8BED3"
                strokeOpacity={0.75}
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={(props) => <ChartMarker {...props} shape={series.shape} ghost />}
                activeDot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Chart key">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-2">
            <span aria-hidden="true" className="font-bold" style={{ color: series.color }}>
              {series.shape === 'circle' ? '●' : series.shape === 'square' ? '■' : '▲'}
            </span>
            {series.name} · {series.dash === '0' ? 'solid' : `dashed ${series.dash}`}
          </li>
        ))}
        {showGhost && <li className="text-[var(--color-muted)]">Dashed gray lines · Ghost Flight Director</li>}
      </ul>
      <p className="mt-3 text-sm text-[var(--color-muted)]" aria-live="polite">{summary}</p>
    </Card>
  );
}
