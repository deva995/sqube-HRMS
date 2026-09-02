import React from 'react';
import { HrmsProvider, useHrms } from './context/HrmsContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { FieldStaffMobileModal } from './components/common/FieldStaffMobileModal';
import { ExecutiveReportModal } from './components/common/ExecutiveReportModal';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardView } from './components/modules/DashboardView';
import { HrModuleView } from './components/modules/HrModuleView';
import { PayrollModuleView } from './components/modules/PayrollModuleView';
import { AttendanceModuleView } from './components/modules/AttendanceModuleView';
import { PerformanceModuleView } from './components/modules/PerformanceModuleView';
import { RecruitmentModuleView } from './components/modules/RecruitmentModuleView';
import { SuperAdminView } from './components/modules/SuperAdminView';
import { LeaveModuleView } from './components/modules/LeaveModuleView';
import { EssModuleView } from './components/modules/EssModuleView';
import { ExpenseModuleView } from './components/modules/ExpenseModuleView';
import { EngagementModuleView } from './components/modules/EngagementModuleView';
import { MarketplaceModuleView } from './components/modules/MarketplaceModuleView';
import { ModuleSkeletonLoader } from './components/common/ModuleSkeletonLoader';

const MainLayout: React.FC = () => {
  const { activeModule, activeSubTab, isModuleLoading, isAuthenticated } = useHrms();

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const renderActiveModule = () => {
    if (isModuleLoading) {
      return <ModuleSkeletonLoader moduleId={activeModule} subTab={activeSubTab} />;
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'hr':
        return <HrModuleView />;
      case 'payroll':
        return <PayrollModuleView />;
      case 'attendance':
        return <AttendanceModuleView />;
      case 'performance':
        return <PerformanceModuleView />;
      case 'recruitment':
        return <RecruitmentModuleView />;
      case 'leave':
        return <LeaveModuleView />;
      case 'ess':
        return <EssModuleView />;
      case 'expense':
        return <ExpenseModuleView />;
      case 'engagement':
        return <EngagementModuleView />;
      case 'marketplace':
        return <MarketplaceModuleView />;
      case 'super-admin':
        return <SuperAdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/90 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient Frosted Glass Background Orbs */}
      <div className="fixed top-[-100px] right-[-100px] w-96 h-96 bg-indigo-300/30 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="fixed bottom-[-100px] left-[80px] w-[28rem] h-[28rem] bg-blue-300/25 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-200/20 blur-[150px] rounded-full pointer-events-none -z-0" />

      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <FieldStaffMobileModal />
      <ExecutiveReportModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <HrmsProvider>
      <MainLayout />
    </HrmsProvider>
  );
}
