import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: 'teal' | 'blue' | 'amber' | 'emerald' | 'purple' | 'rose';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'teal',
  trend,
  onClick,
}) => {
  const iconColorStyles = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-sky-50 text-sky-600 border-sky-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`p-5 flex items-start justify-between cursor-${
        onClick ? 'pointer' : 'default'
      }`}
    >
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline space-x-2">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </p>
          {trend && (
            <span className="text-xs font-semibold text-emerald-600">
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div
        className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${iconColorStyles[iconColor]}`}
      >
        {icon}
      </div>
    </Card>
  );
};
