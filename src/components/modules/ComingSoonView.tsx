import React, { useState } from 'react';
import {
  Sparkles,
  BellRing,
  CheckCircle2,
  Calendar,
  UserCheck,
  HeartHandshake,
  ShoppingBag,
  Receipt,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { ALL_MODULES } from '../../mock/demoData';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import confetti from 'canvas-confetti';

interface ComingSoonViewProps {
  moduleId: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ moduleId }) => {
  const { currentOrg, setActiveModule, setActiveSubTab } = useHrms();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const mod = ALL_MODULES.find((m) => m.id === moduleId) || {
    id: moduleId,
    name: 'Upcoming Module',
    description: 'This capability is on the product roadmap for upcoming release.',
    category: 'Expansion',
  };

  const getModuleDetails = () => {
    switch (moduleId) {
      case 'leave':
        return {
          icon: Calendar,
          features: [
            'Multi-tier leave accrual policies (Earned Leave, Casual Leave, Sick Leave)',
            'Sandwich leave auto-detection & public holiday calendars',
            'Manager multi-level approval hierarchies',
            'Automated leave balance reconciliation with monthly payroll runs',
          ],
        };
      case 'ess':
        return {
          icon: UserCheck,
          features: [
            'Personal profile & emergency contact self-service updates',
            'Tax declaration submission (Form 12BB & 80C investment proofs)',
            'Instant payslip & Form 16 tax certificate self-downloads',
            'Leave application & attendance regularization requests',
          ],
        };
      case 'engagement':
        return {
          icon: HeartHandshake,
          features: [
            'Pulse surveys & eNPS (Employee Net Promoter Score) analytics',
            'Peer-to-peer appreciation badges and recognition wall',
            'Company-wide announcement feeds & AMA polls',
            'Work anniversary & birthday automated celebrations',
          ],
        };
      case 'marketplace':
        return {
          icon: ShoppingBag,
          features: [
            'Pre-built connectors for Slack, Microsoft Teams, and Google Workspace',
            'Accounting sync with Tally, QuickBooks, and Zoho Books',
            'Biometric hardware SDK (ZKTeco, Matrix, eSSL devices)',
            'Background verification API hooks',
          ],
        };
      case 'expense':
        return {
          icon: Receipt,
          features: [
            'OCR receipt scanning & automatic currency conversion',
            'Multi-currency travel expense filing & daily allowance per-diems',
            'Policy limits & automated violation flagging',
            'One-click reimbursement payout batching with payroll cycle',
          ],
        };
      default:
        return {
          icon: Sparkles,
          features: [
            'Enterprise workflow customization',
            'Real-time automated analytics reporting',
            'Audit-compliant logging & data retention',
          ],
        };
    }
  };

  const details = getModuleDetails();
  const Icon = details.icon;

  const handleNotifyMe = () => {
    setIsSubscribed(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div id="coming-soon-view" className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto py-6">
      {/* Disclaimer */}
      <PrototypeDisclaimer
        type="general"
        customText={`"${mod.name}" is planned on the Sqbe HRMS roadmap and is showcased here as part of the complete SaaS blueprint.`}
      />

      {/* Hero Card */}
      <div className="bg-white/75 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50/80 border border-indigo-100/80 text-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-2xs backdrop-blur-xs">
          <Icon className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-200/60 shadow-2xs backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5" />
          Roadmap Preview
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          {mod.name}
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
          {mod.description}
        </p>

        {/* Feature List */}
        <div className="mt-8 text-left bg-white/50 backdrop-blur-xs p-6 rounded-2xl border border-slate-200/80 max-w-2xl mx-auto shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Key Capabilities In Pipeline:
          </h4>
          <ul className="space-y-3 text-xs text-slate-700">
            {details.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive Notification Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleNotifyMe}
            disabled={isSubscribed}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all ${
              isSubscribed
                ? 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/80 shadow-2xs'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSubscribed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Notification Simulated!
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4" />
                Simulate Early Access Alert
              </>
            )}
          </button>

          <button
            onClick={() => {
              setActiveModule('super-admin');
              setActiveSubTab('modules');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-xl hover:bg-white/80 bg-white/40 backdrop-blur-xs transition-colors shadow-2xs"
          >
            <span>Assign in Module Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
