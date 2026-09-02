import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Download,
  Trash2,
  Star,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { MarketplaceApp } from '../../types';
import { marketplaceApi } from '../../services/marketplaceApi';

const DEFAULT_MARKETPLACE_APPS: MarketplaceApp[] = [
  {
    id: 'app-slack',
    name: 'Slack Enterprise Grid',
    slug: 'slack',
    category: 'Communication',
    description: 'Instant leave notifications, attendance clock-in slash commands (/clockin), and HR service desk integration directly in Slack channels.',
    developer: 'Slack Technologies',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    badge: 'Popular',
    rating: 4.9,
    reviewsCount: 1420,
    pricing: 'Free Included',
    isPopular: true,
    installed: true,
  },
  {
    id: 'app-google-workspace',
    name: 'Google Workspace Sync',
    slug: 'google-workspace',
    category: 'Productivity',
    description: 'Bi-directional calendar sync for employee leave schedules, automatic Google Meet links for candidate interviews, and single sign-on (SSO).',
    developer: 'Google LLC',
    icon: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80',
    badge: 'Essential',
    rating: 4.9,
    reviewsCount: 2100,
    pricing: 'Free Included',
    isPopular: true,
    installed: true,
  },
  {
    id: 'app-github',
    name: 'GitHub Enterprise',
    slug: 'github',
    category: 'Developer Tools',
    description: 'Sync engineering performance goals and PR contributions directly with employee OKR dashboards.',
    developer: 'GitHub, Inc.',
    icon: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=100&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 890,
    pricing: 'Free',
    isPopular: true,
    installed: false,
  },
  {
    id: 'app-jira',
    name: 'Atlassian Jira Software',
    slug: 'jira',
    category: 'Developer Tools',
    description: 'Map engineering department tasks and sprint velocity to quarterly employee performance review cycles.',
    developer: 'Atlassian',
    icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 750,
    pricing: 'Free',
    isPopular: false,
    installed: false,
  },
  {
    id: 'app-razorpay',
    name: 'RazorpayX Payroll Gateway',
    slug: 'razorpay',
    category: 'Payments',
    description: '1-click direct statutory salary disbursements to Indian bank accounts via IMPS/NEFT and automated TDS/PF challan filings.',
    developer: 'Razorpay Software',
    icon: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    badge: 'Banking',
    rating: 4.9,
    reviewsCount: 1650,
    pricing: 'Per Transaction',
    isPopular: true,
    installed: true,
  },
  {
    id: 'app-okta',
    name: 'Okta Identity Cloud (SAML SSO)',
    slug: 'okta',
    category: 'Identity',
    description: 'Enterprise Single Sign-On (SAML 2.0 / OIDC), multi-factor authentication enforcement, and automated employee SCIM de-provisioning.',
    developer: 'Okta, Inc.',
    icon: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    badge: 'Security',
    rating: 4.8,
    reviewsCount: 620,
    pricing: 'Enterprise',
    isPopular: false,
    installed: false,
  },
  {
    id: 'app-docusign',
    name: 'DocuSign eSignature',
    slug: 'docusign',
    category: 'Compliance',
    description: 'Send legally binding candidate offer letters, employee NDAs, and statutory consent forms for secure cryptographic electronic signatures.',
    developer: 'DocuSign, Inc.',
    icon: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=100&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 1100,
    pricing: 'Volume Plan',
    isPopular: true,
    installed: false,
  },
  {
    id: 'app-teams',
    name: 'Microsoft Teams & Office 365',
    slug: 'teams',
    category: 'Communication',
    description: 'Automated HR bot for leave approvals, daily attendance check-in reminders, and Outlook calendar integration.',
    developer: 'Microsoft Corporation',
    icon: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 980,
    pricing: 'Free Included',
    isPopular: false,
    installed: false,
  },
];

export const MarketplaceModuleView: React.FC = () => {
  const { currentUserRole, showToast } = useHrms();

  const [apps, setApps] = useState<MarketplaceApp[]>(DEFAULT_MARKETPLACE_APPS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSuperOrAdmin = ['Super Admin', 'Admin'].includes(currentUserRole);

  const fetchApps = async () => {
    try {
      setIsLoading(true);
      const apiApps = await marketplaceApi.getApps();
      if (apiApps && apiApps.length > 0) {
        setApps(apiApps);
      }
    } catch (err: any) {
      // Keep default apps if backend table is not yet seeded
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleToggleInstall = async (appId: string) => {
    if (!isSuperOrAdmin) {
      showToast({ message: 'Only Organization Admins can install integrations.', type: 'error' });
      return;
    }

    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    const newInstalled = !app.installed;
    setApps(apps.map((a) => (a.id === appId ? { ...a, installed: newInstalled } : a)));

    try {
      await marketplaceApi.toggleInstall(appId, newInstalled);
      showToast({
        message: `${app.name} ${newInstalled ? 'installed & activated' : 'uninstalled'} successfully.`,
        type: 'success',
      });
    } catch (err: any) {
      // Local state update was already applied
    }
  };

  const categories = ['All', 'Communication', 'Productivity', 'Developer Tools', 'Payments', 'Identity', 'Compliance'];

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchCat = selectedCategory === 'All' || app.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [apps, selectedCategory, searchQuery]);

  const installedCount = apps.filter((a) => a.installed).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-indigo-600" />
            Sqbe Marketplace & App Integrations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect your HR ecosystem with pre-built, SOC-2 compliant integrations across communication, developer tools, and payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            {installedCount} Integrations Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Available Integrations"
          value={apps.length}
          subtitle="Enterprise certified connectors"
          icon={<Store className="w-5 h-5 text-indigo-600" />}
          gradient="from-indigo-500/10 to-blue-500/10"
        />
        <KpiCard
          title="Active in Tenant"
          value={installedCount}
          subtitle="Currently synced and running"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <KpiCard
          title="Security Standard"
          value="SOC-2 / ISO"
          subtitle="End-to-end encrypted API pipelines"
          icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
          gradient="from-purple-500/10 to-indigo-500/10"
        />
        <KpiCard
          title="Webhook Latency"
          value="< 45ms"
          subtitle="High-availability cloud events"
          icon={<Zap className="w-5 h-5 text-amber-600" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search integrations, developer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                  <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex items-center gap-1.5">
                  {app.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {app.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {app.category}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {app.name}
                </h3>
                <div className="text-xs text-slate-400 font-medium">By {app.developer}</div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {app.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{app.rating}</span>
                <span className="text-slate-400 font-normal">({app.reviewsCount})</span>
              </div>

              <button
                onClick={() => handleToggleInstall(app.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 ${
                  app.installed
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700 border border-emerald-200 hover:border-rose-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                }`}
              >
                {app.installed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Installed
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Connect
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
