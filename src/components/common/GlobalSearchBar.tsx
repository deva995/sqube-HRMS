import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Users,
  FileText,
  Settings,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  Command,
  X,
  MapPin,
  IndianRupee,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  Smartphone,
  ExternalLink,
  Zap,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  Award,
  BookOpen,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, JobPosting, Candidate } from '../../types';

type SearchCategory = 'all' | 'modules' | 'employees' | 'recruitment' | 'documents';

interface SearchResultItem {
  id: string;
  category: 'modules' | 'employees' | 'recruitment' | 'documents';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: any;
  avatar?: string;
  shortcut?: string;
  action: () => void;
}

export const GlobalSearchBar: React.FC = () => {
  const {
    employees,
    allEmployees,
    jobs,
    candidates,
    navigateTo,
    openEmployeeProfile,
    setIsExecutiveReportModalOpen,
    setIsFieldStaffModalOpen,
    toggleOfflineMode,
    showToast,
  } = useHrms();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Global Keyboard shortcut listener (Cmd+K, Ctrl+K, or '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // All Searchable Modules & Sub-Tabs
  const staticModuleItems: SearchResultItem[] = useMemo(
    () => [
      // Core HR
      {
        id: 'mod-hr-roster',
        category: 'modules',
        title: 'Employee Master Directory & Roster',
        subtitle: 'Core HR • Active headcount, CTC compensation & employee records',
        badge: 'HR Core',
        badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Users,
        action: () => navigateTo('hr', 'employees'),
      },
      {
        id: 'mod-hr-org',
        category: 'modules',
        title: 'Organization Structure & Hierarchy Tree',
        subtitle: 'Core HR • Department breakdown, chain of command & reporting lines',
        badge: 'Org Chart',
        badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Building,
        action: () => navigateTo('hr', 'org-structure'),
      },
      {
        id: 'mod-hr-lifecycle',
        category: 'modules',
        title: 'Employee Lifecycle & Transitions',
        subtitle: 'Core HR • Onboarding verification, probation reviews, promotions & exits',
        badge: 'Lifecycle',
        badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Clock,
        action: () => navigateTo('hr', 'lifecycle'),
      },
      // Payroll
      {
        id: 'mod-payroll-wizard',
        category: 'modules',
        title: '6-Step Monthly Payroll Wizard',
        subtitle: 'Payroll • Attendance lock, gross earnings, tax engine & direct disbursement',
        badge: 'Payroll Engine',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: IndianRupee,
        action: () => navigateTo('payroll', 'wizard'),
      },
      {
        id: 'mod-payroll-structure',
        category: 'modules',
        title: 'Salary Structure & Statutory Deductions',
        subtitle: 'Payroll • Basic 40%, HRA, PF 12%, ESI, Professional Tax & TDS brackets',
        badge: 'Tax Rules',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: Settings,
        action: () => navigateTo('payroll', 'structure'),
      },
      {
        id: 'mod-payroll-slips',
        category: 'modules',
        title: 'Payslip Archive & Digital Salary Slips',
        subtitle: 'Payroll • Download PDF salary slips, Form 16 withholding & tax breakdowns',
        badge: 'Payslips',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: FileSpreadsheet,
        action: () => navigateTo('payroll', 'payslips'),
      },
      {
        id: 'mod-payroll-compliance',
        category: 'modules',
        title: 'Statutory Compliance & Tax Challans',
        subtitle: 'Payroll • PF ECR monthly challan, ESI return filing & PT slabs',
        badge: 'Compliance',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: ShieldCheck,
        action: () => navigateTo('payroll', 'compliance'),
      },
      // Attendance
      {
        id: 'mod-att-radar',
        category: 'modules',
        title: 'Live GPS Geofence Radar & Clock-In',
        subtitle: 'Attendance • Real-time coordinate tracking, radar perimeter & clock-in',
        badge: 'Geofence GPS',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: MapPin,
        action: () => navigateTo('attendance', 'overview'),
      },
      {
        id: 'mod-att-geofence',
        category: 'modules',
        title: 'Geofence Boundary Policies & Radii',
        subtitle: 'Attendance • Office coordinates, radial meters & enforcement policies',
        badge: 'Geofence Rules',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Settings,
        action: () => navigateTo('attendance', 'geofences'),
      },
      {
        id: 'mod-att-regularization',
        category: 'modules',
        title: 'Attendance Regularization & Missed Punch Portal',
        subtitle: 'Attendance • Biometric overrides, missed punch requests & approvals',
        badge: 'Approvals',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: CheckCircle2,
        action: () => navigateTo('attendance', 'regularization'),
      },
      {
        id: 'mod-att-shifts',
        category: 'modules',
        title: 'Shift Rostering & Attendance Calendar',
        subtitle: 'Attendance • General, Morning, Afternoon & Night shift allocation matrix',
        badge: 'Roster',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Calendar,
        action: () => navigateTo('attendance', 'shifts'),
      },
      // Performance
      {
        id: 'mod-perf-goals',
        category: 'modules',
        title: 'FY26 OKR Goals & Objectives Tracker',
        subtitle: 'Performance • Department milestones, key results & progress sliders',
        badge: 'OKRs',
        badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: TrendingUp,
        action: () => navigateTo('performance', 'goals'),
      },
      {
        id: 'mod-perf-reviews',
        category: 'modules',
        title: '360-Degree 5-Stage Appraisal Reviews',
        subtitle: 'Performance • Self-assessment, peer feedback, manager review & calibration',
        badge: '360 Reviews',
        badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Sparkles,
        action: () => navigateTo('performance', 'reviews'),
      },
      {
        id: 'mod-perf-analytics',
        category: 'modules',
        title: 'Skill Competency Matrix & Performance Grid',
        subtitle: 'Performance • Talent 9-box matrix, skill ratings & promotion readiness',
        badge: 'Skill Matrix',
        badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Award,
        action: () => navigateTo('performance', 'analytics'),
      },
      // Recruitment
      {
        id: 'mod-rec-pipeline',
        category: 'modules',
        title: '8-Stage ATS Recruitment Kanban Pipeline',
        subtitle: 'Recruitment • Drag-and-drop candidate stages, screening & scorecard evaluations',
        badge: 'ATS Pipeline',
        badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Briefcase,
        action: () => navigateTo('recruitment', 'pipeline'),
      },
      {
        id: 'mod-rec-jobs',
        category: 'modules',
        title: 'Job Requisitions & Career Postings',
        subtitle: 'Recruitment • Open position requisitions, department headcount & hiring status',
        badge: 'Requisitions',
        badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: FileText,
        action: () => navigateTo('recruitment', 'jobs'),
      },
      {
        id: 'mod-rec-interviews',
        category: 'modules',
        title: 'Interview Scheduling & Scorecards',
        subtitle: 'Recruitment • Candidate interview rounds, scoring rubrics & hiring feedback',
        badge: 'Interviews',
        badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Calendar,
        action: () => navigateTo('recruitment', 'interviews'),
      },
      // Super Admin
      {
        id: 'mod-super-matrix',
        category: 'modules',
        title: 'Multi-Tenant Module Matrix (Centerpiece)',
        subtitle: 'Super Admin • Configure and toggle active SaaS modules per tenant',
        badge: 'Super Admin',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: Layers,
        action: () => navigateTo('super-admin', 'modules'),
      },
      {
        id: 'mod-super-roles',
        category: 'modules',
        title: 'RBAC Roles & UI Gating Simulator',
        subtitle: 'Super Admin • Switch between Super Admin, Admin, Manager, Lead & Executive',
        badge: 'RBAC Gating',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: ShieldCheck,
        action: () => navigateTo('super-admin', 'roles'),
      },
      {
        id: 'mod-super-audit',
        category: 'modules',
        title: 'Immutable Compliance Audit Log Trail',
        subtitle: 'Super Admin • Chronological state changes, IP traces & activity history',
        badge: 'Audit Trail',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: FileText,
        action: () => navigateTo('super-admin', 'audit'),
      },
    ],
    [navigateTo]
  );

  // Searchable Documents and Action Tools
  const staticDocumentItems: SearchResultItem[] = useMemo(
    () => [
      {
        id: 'doc-exec-report',
        category: 'documents',
        title: 'Monthly Executive HR Insights PDF Report',
        subtitle: 'Download consolidated executive analytics, headcount & payroll PDF',
        badge: 'PDF Generator',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: FileText,
        action: () => {
          setIsExecutiveReportModalOpen(true);
          showToast({
            title: 'Report Ready',
            message: 'Opened Monthly Executive PDF Report Preview',
            type: 'info',
          });
        },
      },
      {
        id: 'doc-tool-mobile',
        category: 'documents',
        title: 'Field Staff Smartphone Punch Simulator',
        subtitle: 'Interactive virtual mobile smartphone with GPS geofence clock-in',
        badge: 'Mobile Simulator',
        badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Smartphone,
        action: () => {
          setIsFieldStaffModalOpen(true);
          showToast({
            title: 'Mobile Mode',
            message: 'Launched Field Staff Smartphone Punch Simulator',
            type: 'info',
          });
        },
      },
      {
        id: 'doc-tool-offline',
        category: 'documents',
        title: 'Offline Mode & Local Queue Sync Simulation',
        subtitle: 'Simulate network cut-off and local queue auto-replay upon reconnection',
        badge: 'Connectivity',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: Settings,
        action: () => toggleOfflineMode(),
      },
      {
        id: 'doc-form16',
        category: 'documents',
        title: 'Form 16 TDS Statutory Tax Certificate',
        subtitle: 'Annual Indian Income Tax Section 203 Withholding Certificate',
        badge: 'Tax Form',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: FileSpreadsheet,
        action: () => navigateTo('payroll', 'payslips'),
      },
      {
        id: 'doc-posh',
        category: 'documents',
        title: 'POSH & Anti-Harassment Workplace Policy',
        subtitle: 'Mandatory organizational ethics, compliance & safety guidelines',
        badge: 'Company Policy',
        badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: BookOpen,
        action: () => navigateTo('hr', 'org-structure'),
      },
    ],
    [setIsExecutiveReportModalOpen, setIsFieldStaffModalOpen, toggleOfflineMode, navigateTo, showToast]
  );

  // Dynamic Specific Employees Records (Searching across all registered employees)
  const employeeItems: SearchResultItem[] = useMemo(() => {
    const list = (allEmployees && allEmployees.length > 0) ? allEmployees : employees;
    return list.map((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.trim();
      return {
        id: `emp-${emp.id}`,
        category: 'employees',
        title: `${fullName} (${emp.employeeCode})`,
        subtitle: `${emp.designation} • ${emp.department} • ${emp.email} • ${emp.location}`,
        badge: emp.status,
        badgeColor:
          emp.status === 'Active'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : emp.status === 'Probation'
            ? 'bg-amber-100 text-amber-700 border-amber-200'
            : 'bg-rose-100 text-rose-700 border-rose-200',
        icon: Users,
        avatar: emp.avatar,
        action: () => {
          openEmployeeProfile(emp.id);
        },
      };
    });
  }, [allEmployees, employees, openEmployeeProfile]);

  // Dynamic Jobs & Candidate Records
  const recruitmentItems: SearchResultItem[] = useMemo(() => {
    const jobItems: SearchResultItem[] = jobs.map((job) => ({
      id: `job-${job.id}`,
      category: 'recruitment',
      title: job.title,
      subtitle: `Requisition • ${job.department} • ${job.location} • ${job.openings} Openings • ${job.appliedCount} Applicants`,
      badge: job.status,
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Briefcase,
      action: () => navigateTo('recruitment', 'jobs'),
    }));

    const candItems: SearchResultItem[] = candidates.map((cand) => ({
      id: `cand-${cand.id}`,
      category: 'recruitment',
      title: `${cand.name} (Candidate)`,
      subtitle: `Applied for ${cand.jobTitle} • Rating: ${cand.rating}/5.0 • Stage: ${cand.stage}`,
      badge: cand.stage,
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: UserCheck,
      action: () => navigateTo('recruitment', 'pipeline'),
    }));

    return [...jobItems, ...candItems];
  }, [jobs, candidates, navigateTo]);

  // Combined searchable master items
  const allItems: SearchResultItem[] = useMemo(() => {
    return [
      ...staticModuleItems,
      ...employeeItems,
      ...recruitmentItems,
      ...staticDocumentItems,
    ];
  }, [staticModuleItems, employeeItems, recruitmentItems, staticDocumentItems]);

  // Filtered Results based on search text and active category
  const filteredResults: SearchResultItem[] = useMemo(() => {
    let list = allItems;
    if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory);
    }

    if (!query.trim()) {
      // Default curation when query is empty: popular modules and employees
      return list.slice(0, 10);
    }

    const q = query.toLowerCase().trim();
    return list
      .filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const subMatch = item.subtitle.toLowerCase().includes(q);
        const badgeMatch = item.badge.toLowerCase().includes(q);
        return titleMatch || subMatch || badgeMatch;
      })
      .slice(0, 15);
  }, [allItems, activeCategory, query]);

  // Keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredResults.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectItem(filteredResults[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    item.action();
    setIsOpen(false);
    setQuery('');
  };

  const categories: { id: SearchCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: allItems.length },
    { id: 'modules', label: 'Modules & Views', count: staticModuleItems.length },
    { id: 'employees', label: 'Employees', count: employeeItems.length },
    { id: 'recruitment', label: 'Recruitment & ATS', count: recruitmentItems.length },
    { id: 'documents', label: 'Documents & Tools', count: staticDocumentItems.length },
  ];

  // Quick action shortcut pills
  const quickActionShortcuts = [
    { label: '⚡ Payroll Wizard', action: () => navigateTo('payroll', 'wizard') },
    { label: '📍 GPS Radar', action: () => navigateTo('attendance', 'overview') },
    { label: '👥 Employee Roster', action: () => navigateTo('hr', 'employees') },
    { label: '🎯 OKR Goals', action: () => navigateTo('performance', 'goals') },
    { label: '📱 Mobile Punch', action: () => setIsFieldStaffModalOpen(true) },
  ];

  return (
    <div id="global-search-bar-container" ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          id="global-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Search modules, employee records, payroll, OKRs (⌘K)..."
          className="w-full pl-9 pr-14 py-1.5 bg-slate-100/80 hover:bg-white/95 focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs backdrop-blur-xs"
        />

        {/* Clear or Shortcut badge */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 bg-white/90 border border-slate-200 rounded-md shadow-2xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          )}
        </div>
      </div>

      {/* Interactive Quick-Jump Search Results Dropdown */}
      {isOpen && (
        <div
          id="global-search-results-dropdown"
          className="absolute left-0 right-0 mt-2 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[82vh] flex flex-col min-w-[320px] sm:min-w-[540px]"
        >
          {/* Top Quick Suggestions Chips */}
          {!query && (
            <div className="px-3 pb-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-indigo-500" />
                <span>Quick:</span>
              </span>
              {quickActionShortcuts.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    chip.action();
                    setIsOpen(false);
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Filter Category Tabs */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat.id
                      ? 'bg-indigo-700 text-white font-mono'
                      : 'bg-slate-200 text-slate-600 font-mono'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Results List */}
          <div
            ref={resultsContainerRef}
            className="flex-1 overflow-y-auto divide-y divide-slate-100 py-1 max-h-[52vh]"
          >
            {filteredResults.length > 0 ? (
              filteredResults.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/90 text-indigo-900 border-l-4 border-indigo-600 pl-3'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar for employee or Icon */}
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.title}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs truncate text-slate-900">
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                      <span className="text-[10px] font-medium hidden sm:inline">
                        {item.category === 'employees' ? 'View Profile' : 'Jump'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center px-4">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  No matching modules, employees, or records found
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                  Try searching for employee names like "Rajesh" or "Sneha", or modules like "Payroll", "Geofence", "OKRs", or "ATS".
                </p>
              </div>
            )}
          </div>

          {/* Quick Footer Navigation Hint */}
          <div className="px-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 font-mono">
                  ↑↓
                </kbd>{' '}
                Navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 font-mono">
                  ↵
                </kbd>{' '}
                Select & Jump
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 font-mono">
                  Esc
                </kbd>{' '}
                Close
              </span>
            </div>
            <span className="text-indigo-600 font-bold">
              {filteredResults.length} instant results
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
