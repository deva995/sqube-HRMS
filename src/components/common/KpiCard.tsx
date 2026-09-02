import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  title,
  value,
  change,
  trend = 'up',
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50/80',
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:bg-white/95 hover:border-indigo-300/80 hover:shadow-md hover:-translate-y-0.5'
          : 'hover:bg-white/85'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} shrink-0 border border-slate-100 shadow-2xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
          {value}
        </span>
      </div>

      {(change || subtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {change && (
            <span
              className={`inline-flex items-center font-bold ${
                trend === 'up'
                  ? 'text-emerald-600'
                  : trend === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5 mr-0.5" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
