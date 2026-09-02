import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Fingerprint,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  Shield,
  Zap,
  Globe2,
  Check,
  Briefcase,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Role, UserPersona } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, allPersonas, organizations } = useHrms();

  // Selected persona or custom form values
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('user-super');
  const [email, setEmail] = useState<string>('superadmin@sqbehrms.com');
  const [password, setPassword] = useState<string>('sqbeDemo2026!');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-apex');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Categorized Personas according to user requirements
  const superAdminPersona = allPersonas.find((p) => p.role === 'Super Admin') || allPersonas[0];
  const adminPersona = allPersonas.find((p) => p.role === 'Admin' || p.role === 'Org Admin') || allPersonas[1];
  const managerPersona = allPersonas.find((p) => p.role === 'Manager') || allPersonas[2];
  const teamLeadPersona = allPersonas.find((p) => p.role === 'Team Lead') || allPersonas[3];
  const executivePersona = allPersonas.find((p) => p.role === 'Executive' || p.role === 'Employee') || allPersonas[4];

  // Handle persona selection
  const handleSelectPersona = (p: UserPersona) => {
    setSelectedPersonaId(p.id);
    setEmail(p.email);
    setPassword('sqbeDemo2026!');
    setSelectedOrgId(p.orgId || 'org-apex');
    setAuthError(null);
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    setTimeout(() => {
      login({
        email,
        password,
        personaId: selectedPersonaId,
        orgId: selectedOrgId,
      });
      setIsLoading(false);
    }, 450);
  };

  // Quick instant login
  const handleQuickLogin = (persona: UserPersona) => {
    setIsLoading(true);
    setSelectedPersonaId(persona.id);
    setEmail(persona.email);
    setTimeout(() => {
      login({
        personaId: persona.id,
        role: persona.role,
        orgId: persona.orgId || selectedOrgId,
      });
      setIsLoading(false);
    }, 350);
  };

  return (
    <div id="sqbe-login-page" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[600px] h-[600px] bg-blue-600/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 blur-[180px] rounded-full pointer-events-none" />

      {/* Grid Pattern Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Enterprise Value Showcase & Security Credentials */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Top Brand Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Sqbe HRMS Enterprise Cloud
              </span>
              <span className="bg-indigo-500/20 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                v2.4
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading leading-tight">
                Sqbe HRMS <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-blue-400">
                  Role-Gated Workspace Demo
                </span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                Explore customized views and granular permission hierarchies across all 3 primary operational tiers:
              </p>
            </div>

            {/* Role Hierarchy Visual Guide */}
            <div className="space-y-2.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Configured Demo Roles & Views</span>
              </div>

              {/* 1. Super Admin */}
              <div className="p-2.5 rounded-xl bg-slate-850/80 border border-indigo-500/30 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  1.
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Super admin</div>
                  <div className="text-[11px] text-slate-400">Global multi-tenant matrix, organization provisioning & audit logs.</div>
                </div>
              </div>

              {/* 2. Admin */}
              <div className="p-2.5 rounded-xl bg-slate-850/80 border border-blue-500/30 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  2.
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200">Admin</div>
                  <div className="text-[11px] text-slate-400">Company HR lifecycle, 6-step Indian payroll, attendance geofence setup.</div>
                </div>
              </div>

              {/* 3. Employee */}
              <div className="p-2.5 rounded-xl bg-slate-850/80 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                    3.
                  </span>
                  <span className="text-xs font-bold text-slate-200">Employee Tier</span>
                </div>

                <div className="pl-6 space-y-1.5 text-[11px] border-l border-slate-700/60 ml-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span><strong className="text-indigo-300 font-mono">3.1</strong> Manager</span>
                    <span className="text-[10px] text-slate-500">Team approvals & 360 review</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span><strong className="text-teal-300 font-mono">3.2</strong> Team Lead</span>
                    <span className="text-[10px] text-slate-500">Squad roster & sprint OKRs</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span><strong className="text-sky-300 font-mono">3.3</strong> Executive / IC</span>
                    <span className="text-[10px] text-slate-500">ESS geofence punch & payslips</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Multi-Tenant Stats Pill */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">3 Enterprise Tenants Ready</span>
                  <span className="text-[10px] text-slate-400">Apex Technologies, Zenith Healthcare, Kaveri Logistics</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-emerald-400 border border-slate-700">
                <Shield className="w-3.5 h-3.5" />
                <span>Sqbe Core</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Login Card with Separated Dummy Logins */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 text-left relative overflow-hidden space-y-5">
              {/* Header Gradient Top Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />

              {/* Login Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/30">
                    SQ
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-heading">Sign in to Sqbe HRMS</h2>
                    <p className="text-xs text-slate-400">Choose dummy login persona or sign in manually</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Interactive Demo</span>
                </div>
              </div>

              {/* 1-CLICK DUMMY LOGINS SEPARATED BY ROLE */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Select Dummy Persona by Role</span>
                  </label>
                  <span className="text-[10px] text-slate-400">1-Click Instant Access</span>
                </div>

                {/* Structured Role Cards Accordion / Grid */}
                <div className="space-y-2.5">
                  {/* 1. Super Admin Card */}
                  <div
                    onClick={() => handleSelectPersona(superAdminPersona)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedPersonaId === superAdminPersona.id
                        ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={superAdminPersona.avatar}
                          alt={superAdminPersona.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-indigo-400/50"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                              1. Super admin
                            </span>
                            <span className="text-xs font-bold text-white">
                              {superAdminPersona.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {superAdminPersona.designation} • Global Platform Owner
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(superAdminPersona);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <span>⚡ Enter Demo</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Admin Card */}
                  <div
                    onClick={() => handleSelectPersona(adminPersona)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedPersonaId === adminPersona.id
                        ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={adminPersona.avatar}
                          alt={adminPersona.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-blue-400/50"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                              2. Admin
                            </span>
                            <span className="text-xs font-bold text-white">
                              {adminPersona.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {adminPersona.designation} • HR Director
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(adminPersona);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <span>⚡ Enter Demo</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Employee Group Container with 3.1, 3.2, 3.3 */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>3. Employee Roles</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Select Sub-role</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* 3.1 Manager */}
                      <div
                        onClick={() => handleSelectPersona(managerPersona)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedPersonaId === managerPersona.id
                            ? 'bg-indigo-950/90 border-indigo-500 ring-1 ring-indigo-500'
                            : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold">
                              3.1 Manager
                            </span>
                            <img
                              src={managerPersona.avatar}
                              alt={managerPersona.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          </div>
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {managerPersona.name.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            Engineering Manager
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(managerPersona);
                          }}
                          className="mt-2.5 w-full py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Login as 3.1
                        </button>
                      </div>

                      {/* 3.2 Team Lead */}
                      <div
                        onClick={() => handleSelectPersona(teamLeadPersona)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedPersonaId === teamLeadPersona.id
                            ? 'bg-teal-950/90 border-teal-500 ring-1 ring-teal-500'
                            : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[9px] font-bold">
                              3.2 Team Lead
                            </span>
                            <img
                              src={teamLeadPersona.avatar}
                              alt={teamLeadPersona.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          </div>
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {teamLeadPersona.name.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            Squad Architect
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(teamLeadPersona);
                          }}
                          className="mt-2.5 w-full py-1 bg-teal-600/80 hover:bg-teal-600 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Login as 3.2
                        </button>
                      </div>

                      {/* 3.3 Executive / IC */}
                      <div
                        onClick={() => handleSelectPersona(executivePersona)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedPersonaId === executivePersona.id
                            ? 'bg-sky-950/90 border-sky-500 ring-1 ring-sky-500'
                            : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[9px] font-bold">
                              3.3 Executive / IC
                            </span>
                            <img
                              src={executivePersona.avatar}
                              alt={executivePersona.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          </div>
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {executivePersona.name.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            Full Stack Engineer
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(executivePersona);
                          }}
                          className="mt-2.5 w-full py-1 bg-sky-600/80 hover:bg-sky-600 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Login as 3.3
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traditional Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Organization Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enterprise Tenant Scope
                    </label>
                    <div className="relative">
                      <select
                        value={selectedOrgId}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                      >
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                        <option value="all">All Organizations (Consolidated)</option>
                      </select>
                      <Building2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      User Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setAuthError(null);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In with Selected Persona</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
