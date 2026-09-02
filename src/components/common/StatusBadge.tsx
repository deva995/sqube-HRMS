import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getColors = (st: string) => {
    const s = st.toLowerCase();
    
    // Success / Active
    if (
      s.includes('active') ||
      s.includes('present') ||
      s.includes('approved') ||
      s.includes('completed') ||
      s.includes('hired') ||
      s.includes('published') ||
      s.includes('inside') ||
      s.includes('disbursed') ||
      s.includes('on track')
    ) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10';
    }

    // Warning / Pending / Review / Outside
    if (
      s.includes('pending') ||
      s.includes('late') ||
      s.includes('outside') ||
      s.includes('calculated') ||
      s.includes('interview') ||
      s.includes('technical') ||
      s.includes('screening') ||
      s.includes('shortlisted') ||
      s.includes('notice') ||
      s.includes('warning') ||
      s.includes('probation') ||
      s.includes('at risk')
    ) {
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10';
    }

    // Danger / Absent / Blocked / Rejected
    if (
      s.includes('absent') ||
      s.includes('rejected') ||
      s.includes('block') ||
      s.includes('terminated') ||
      s.includes('closed') ||
      s.includes('behind') ||
      s.includes('failed') ||
      s.includes('unavailable')
    ) {
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10';
    }

    // Info / In Progress / Draft / Neutral
    if (
      s.includes('draft') ||
      s.includes('offer') ||
      s.includes('trial') ||
      s.includes('leave') ||
      s.includes('half day')
    ) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/10';
    }

    return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/10';
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] font-medium'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${sizeClasses} ${getColors(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span className="whitespace-nowrap">{status}</span>
    </span>
  );
};
