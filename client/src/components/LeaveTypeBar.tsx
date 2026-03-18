import React from 'react';

interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  items: BarItem[];
  total: number;
}

export function LeaveTypeBar({ items, total }: Props) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  return (
    <div className="hbar-chart">
      {sorted.map((item) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const width = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div className="hbar-row" key={item.label}>
            <div className="hbar-meta">
              <span className="hbar-label">{item.label}</span>
              <span className="hbar-count">{item.value} officers · {pct}%</span>
            </div>
            <div className="hbar-track">
              <div
                className="hbar-fill"
                style={{ width: `${width}%`, background: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
