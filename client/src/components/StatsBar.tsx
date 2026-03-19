import React from 'react';
import { Stats } from '../types';
import { IconUsers, IconAlertTriangle, IconActivity, IconWallet } from './Icons';

interface Props {
  stats: Stats | null;
  activeFilter: string | null;
  onFilter: (status: string | null) => void;
}

export function StatsBar({ stats, activeFilter, onFilter }: Props) {
  const cards = [
    {
      key: null,
      label: 'Total Officers',
      value: stats?.total ?? '—',
      sub: 'All leave records',
      Icon: IconUsers,
      accent: '#495057',
      bg: '#F1F3F5',
    },
    {
      key: 'Overdue',
      label: 'Overdue',
      value: stats?.overdue ?? '—',
      sub: 'Resumption date passed',
      Icon: IconAlertTriangle,
      accent: '#C8102E',
      bg: '#FDECEA',
    },
    {
      key: 'Ongoing',
      label: 'Currently Active',
      value: stats?.ongoing ?? '—',
      sub: 'Leave in progress',
      Icon: IconActivity,
      accent: '#2E7D32',
      bg: '#E8F5E9',
    },
    {
      key: 'unpaid',
      label: 'Unpaid Leave',
      value: stats?.unpaid ?? '—',
      sub: 'No pay during leave',
      Icon: IconWallet,
      accent: '#7B3F00',
      bg: '#FFF3E0',
    },
  ];

  const handleClick = (key: string | null) => {
    if (key === 'unpaid') return;
    onFilter(activeFilter === key ? null : key);
  };

  return (
    <div className="stats-bar">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`stat-card${activeFilter === card.key && card.key !== null ? ' active' : ''}`}
          style={{ '--card-accent': card.accent, '--card-bg': card.bg } as React.CSSProperties}
          onClick={() => handleClick(card.key)}
          title={card.key !== 'unpaid' ? `Click to filter by ${card.label}` : undefined}
        >
          <div className="stat-icon">
            <card.Icon size={22} color={card.accent} />
          </div>
          <div className="stat-body">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
