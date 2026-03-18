import React, { useState } from 'react';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
  total: number;
  onSegmentClick?: (label: string) => void;
  activeLabel?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function annularSector(cx: number, cy: number, inner: number, outer: number, start: number, end: number): string {
  const o1 = polarToCartesian(cx, cy, outer, start);
  const o2 = polarToCartesian(cx, cy, outer, end);
  const i1 = polarToCartesian(cx, cy, inner, end);
  const i2 = polarToCartesian(cx, cy, inner, start);
  const large = end - start > Math.PI ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export function DonutChart({ segments, total, onSegmentClick, activeLabel }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const cx = 80, cy = 80, outerR = 72, innerR = 46;
  const GAP = 0.025;
  let angle = -Math.PI / 2;

  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const sweep = (s.value / total) * 2 * Math.PI - GAP;
      const startA = angle;
      const endA = startA + sweep;
      angle += (s.value / total) * 2 * Math.PI;
      return { ...s, path: annularSector(cx, cy, innerR, outerR, startA, endA) };
    });

  return (
    <div className="donut-wrap">
      <div className="donut-svg-wrap">
        <svg viewBox="0 0 160 160" className="donut-svg">
          {arcs.map((arc) => {
            const isActive = activeLabel === arc.label || hovered === arc.label;
            return (
              <path
                key={arc.label}
                d={arc.path}
                fill={arc.color}
                className="donut-path"
                opacity={activeLabel && activeLabel !== arc.label && hovered !== arc.label ? 0.35 : isActive ? 1 : 0.88}
                transform={isActive ? `scale(1.04)` : 'scale(1)'}
                style={{ transformOrigin: '80px 80px', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHovered(arc.label)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSegmentClick?.(arc.label)}
              />
            );
          })}
          <text x={cx} y={cy - 7} textAnchor="middle" className="donut-center-value">
            {total}
          </text>
          <text x={cx} y={cx + 12} textAnchor="middle" className="donut-center-label">
            Total
          </text>
        </svg>
      </div>
      <div className="donut-legend">
        {arcs.map((arc) => {
          const pct = total > 0 ? Math.round((arc.value / total) * 100) : 0;
          return (
            <div
              key={arc.label}
              className={`legend-item${activeLabel === arc.label ? ' active' : ''}`}
              onClick={() => onSegmentClick?.(arc.label)}
              onMouseEnter={() => setHovered(arc.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="legend-dot" style={{ background: arc.color }} />
              <span className="legend-name">{arc.label}</span>
              <span className="legend-count">{arc.value}</span>
              <span className="legend-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
