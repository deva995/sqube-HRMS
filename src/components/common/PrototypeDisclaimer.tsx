import React, { useState } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';

interface PrototypeDisclaimerProps {
  type?: 'general' | 'statutory' | 'geolocation' | 'rbac';
  customText?: string;
  className?: string;
}

export const PrototypeDisclaimer: React.FC<PrototypeDisclaimerProps> = ({
  type = 'general',
  customText,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  let message = customText;
  let title = 'System Advisory Notice';

  if (!message) {
    switch (type) {
      case 'statutory':
        title = 'Illustrative Payroll Calculations Only';
        message =
          'Statutory calculations (EPF ceiling, ESI thresholds, state PT, TDS slabs) are simulated and subject to periodic state & central tax updates.';
        break;
      case 'geolocation':
        title = 'Server-Verified Geofence & Device GPS Advisory';
        message =
          'Device GPS coordinates are self-reported by client hardware and can be spoofed by location-mocking applications. The backend enforces authoritative Haversine great-circle calculation, radius threshold policies, and timestamp drift sanity checks to verify punch integrity.';
        break;
      case 'rbac':
        title = 'Role-Based Access Control Active';
        message =
          'Role switcher configures permissions and module accessibility in real-time based on the selected security policy.';
        break;
      default:
        message =
          'Live interactive workspace. You can freely simulate role switching, switch tenant organizations, onboard employees, disburse payroll, and toggle module matrices in real-time.';
    }
  }

  return (
    <div
      id={`disclaimer-${type}`}
      className={`flex items-start gap-3 p-3 rounded-lg border text-xs bg-amber-50/80 border-amber-200/90 text-amber-900 shadow-xs ${className}`}
    >
      <div className="p-1 rounded-md bg-amber-100/90 text-amber-800 shrink-0">
        {type === 'statutory' || type === 'geolocation' ? (
          <ShieldAlert className="w-3.5 h-3.5" />
        ) : (
          <Info className="w-3.5 h-3.5" />
        )}
      </div>
      <div className="flex-1 leading-relaxed">
        <span className="font-semibold text-amber-950 block sm:inline mr-1.5">
          {title}:
        </span>
        <span className="text-amber-800">{message}</span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="text-amber-600 hover:text-amber-900 p-0.5 rounded-md hover:bg-amber-100/60 transition-colors"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
