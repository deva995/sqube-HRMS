import React from 'react';
import { Sparkles } from 'lucide-react';

interface ModuleSkeletonLoaderProps {
  moduleId: string;
  subTab?: string;
}

export const ModuleSkeletonLoader: React.FC<ModuleSkeletonLoaderProps> = ({
  moduleId,
  subTab,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn transition-opacity duration-200">
      {/* 1. Header & Sub-Nav Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-24 h-4 bg-slate-200/70 rounded-full animate-pulse backdrop-blur-xs" />
            <div className="w-16 h-4 bg-slate-200/50 rounded-full animate-pulse" />
          </div>
          <div className="w-56 sm:w-72 h-7 bg-slate-300/60 rounded-xl animate-pulse backdrop-blur-xs" />
          <div className="w-64 sm:w-96 h-4 bg-slate-200/60 rounded-lg animate-pulse" />
        </div>

        {/* Sub Navigation Skeleton Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/40 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs overflow-x-auto w-fit">
          <div className="w-20 h-7 bg-white/80 rounded-lg animate-pulse shadow-xs" />
          <div className="w-24 h-7 bg-slate-200/60 rounded-lg animate-pulse" />
          <div className="w-20 h-7 bg-slate-200/60 rounded-lg animate-pulse" />
          <div className="w-24 h-7 bg-slate-200/60 rounded-lg animate-pulse hidden sm:block" />
        </div>
      </div>

      {/* 2. Frosted 4-KPI Metric Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 relative overflow-hidden"
          >
            {/* Shimmer linear gradient highlight */}
            <div className="flex items-center justify-between">
              <div className="w-24 h-3.5 bg-slate-200/80 rounded-md animate-pulse" />
              <div className="w-9 h-9 rounded-xl bg-slate-200/70 border border-slate-200/60 animate-pulse" />
            </div>
            <div className="w-28 h-7 bg-slate-300/70 rounded-lg animate-pulse" />
            <div className="flex items-center gap-2 pt-1">
              <div className="w-14 h-4 bg-emerald-100/70 rounded-full animate-pulse" />
              <div className="w-24 h-3 bg-slate-200/60 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Module Specific Skeleton Layouts */}
      {renderModuleSpecificSkeleton(moduleId, subTab)}
    </div>
  );
};

function renderModuleSpecificSkeleton(moduleId: string, subTab?: string) {
  switch (moduleId) {
    case 'dashboard':
      return (
        <div className="space-y-6">
          {/* Hero Banner Shimmer */}
          <div className="p-6 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2.5">
              <div className="w-36 h-4 bg-indigo-400/40 rounded-full animate-pulse" />
              <div className="w-64 h-6 bg-slate-700/80 rounded-xl animate-pulse" />
              <div className="w-80 h-3.5 bg-slate-700/50 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="w-32 h-9 bg-indigo-600/60 rounded-xl animate-pulse" />
              <div className="w-28 h-9 bg-slate-800/80 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* 2-Column Bento Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area Skeleton */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-48 h-5 bg-slate-300/80 rounded-lg animate-pulse" />
                <div className="w-24 h-7 bg-slate-200/60 rounded-lg animate-pulse" />
              </div>
              <div className="h-64 bg-slate-100/80 rounded-xl border border-slate-200/50 flex items-end justify-between p-6 gap-3">
                {[40, 65, 30, 85, 55, 70, 90, 45, 60, 75, 80, 95].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-full bg-slate-200/80 rounded-t-md animate-pulse"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Activity Stream Skeleton */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="w-36 h-5 bg-slate-300/80 rounded-lg animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="p-3 bg-white/50 rounded-xl border border-slate-200/60 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200/80 shrink-0 animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-3/4 h-3.5 bg-slate-300/70 rounded-md animate-pulse" />
                      <div className="w-1/2 h-3 bg-slate-200/60 rounded-md animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'hr':
      return (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          {/* Table Header & Search Bar Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
            <div className="space-y-1.5">
              <div className="w-40 h-5 bg-slate-300/80 rounded-lg animate-pulse" />
              <div className="w-64 h-3.5 bg-slate-200/60 rounded-md animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-48 sm:w-64 h-8 bg-slate-200/60 rounded-xl animate-pulse" />
              <div className="w-28 h-8 bg-indigo-600/50 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div
                key={row}
                className="p-3.5 bg-white/50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-1/3">
                  <div className="w-9 h-9 rounded-full bg-slate-300/70 shrink-0 animate-pulse" />
                  <div className="space-y-1 w-full">
                    <div className="w-32 h-3.5 bg-slate-300/80 rounded-md animate-pulse" />
                    <div className="w-44 h-3 bg-slate-200/60 rounded-md animate-pulse" />
                  </div>
                </div>
                <div className="w-1/4 space-y-1 hidden sm:block">
                  <div className="w-28 h-3.5 bg-slate-300/70 rounded-md animate-pulse" />
                  <div className="w-20 h-3 bg-slate-200/60 rounded-md animate-pulse" />
                </div>
                <div className="w-20 h-4 bg-slate-200/80 rounded-full animate-pulse" />
                <div className="w-24 h-4 bg-slate-300/70 rounded-md animate-pulse" />
                <div className="w-8 h-8 rounded-lg bg-slate-200/70 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'payroll':
      return (
        <div className="space-y-6">
          {/* Payroll Run Progress Wizard Skeleton */}
          <div className="p-6 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 shadow-lg text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="w-32 h-4 bg-indigo-400/40 rounded-full animate-pulse" />
                <div className="w-56 h-6 bg-slate-700/80 rounded-xl animate-pulse" />
              </div>
              <div className="w-36 h-9 bg-indigo-600/70 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-6 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6].map((st) => (
                <div key={st} className="h-2 bg-slate-700/80 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Historical Table Skeleton */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="w-48 h-5 bg-slate-300/80 rounded-lg animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="p-4 bg-white/50 rounded-xl border border-slate-200/60 flex items-center justify-between"
                >
                  <div className="w-32 h-4 bg-slate-300/80 rounded-md animate-pulse" />
                  <div className="w-20 h-4 bg-slate-200/70 rounded-md animate-pulse" />
                  <div className="w-28 h-4 bg-slate-300/70 rounded-md animate-pulse" />
                  <div className="w-20 h-6 bg-emerald-100/70 rounded-full animate-pulse" />
                  <div className="w-24 h-8 bg-indigo-50/80 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'attendance':
      return (
        <div className="space-y-6">
          {/* Live Clock-In Card Skeleton */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="w-28 h-3.5 bg-indigo-200/70 rounded-md animate-pulse" />
              <div className="w-64 h-6 bg-slate-300/80 rounded-xl animate-pulse" />
              <div className="w-72 h-3.5 bg-slate-200/60 rounded-md animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="w-36 h-10 bg-indigo-600/60 rounded-xl animate-pulse" />
              <div className="w-36 h-10 bg-slate-200/70 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Geofence Radar Preview & Log Table Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col items-center justify-center min-h-[260px] space-y-4">
              <div className="w-36 h-36 rounded-full border-4 border-dashed border-indigo-200/60 flex items-center justify-center animate-spin">
                <div className="w-16 h-16 rounded-full bg-indigo-100/70 animate-pulse" />
              </div>
              <div className="w-40 h-4 bg-slate-200/70 rounded-md animate-pulse" />
            </div>
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="w-44 h-5 bg-slate-300/80 rounded-lg animate-pulse mb-3" />
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-white/50 rounded-xl border border-slate-200/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-300/70 animate-pulse" />
                    <div className="w-28 h-3.5 bg-slate-300/80 rounded-md animate-pulse" />
                  </div>
                  <div className="w-20 h-4 bg-slate-200/70 rounded-md animate-pulse" />
                  <div className="w-24 h-4 bg-slate-200/70 rounded-md animate-pulse" />
                  <div className="w-16 h-5 bg-emerald-100/70 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'performance':
      return (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="w-52 h-5 bg-slate-300/80 rounded-lg animate-pulse" />
              <div className="w-72 h-3.5 bg-slate-200/60 rounded-md animate-pulse" />
            </div>
            <div className="w-32 h-8 bg-indigo-600/60 rounded-xl animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((card) => (
              <div
                key={card}
                className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-48 h-4 bg-slate-300/80 rounded-md animate-pulse" />
                  <div className="w-16 h-5 bg-indigo-100/70 rounded-full animate-pulse" />
                </div>
                <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div className="w-3/5 h-full bg-indigo-300/70 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="w-24 h-3 bg-slate-200/70 rounded-md animate-pulse" />
                  <div className="w-20 h-3 bg-slate-200/70 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'recruitment':
      return (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="w-48 h-5 bg-slate-300/80 rounded-lg animate-pulse" />
              <div className="w-64 h-3.5 bg-slate-200/60 rounded-md animate-pulse" />
            </div>
            <div className="w-36 h-8 bg-indigo-600/60 rounded-xl animate-pulse" />
          </div>

          {/* Kanban Board Skeletons */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {['Applied', 'Screening', 'Technical Round', 'Managerial', 'Offer'].map(
              (stage) => (
                <div
                  key={stage}
                  className="w-72 shrink-0 bg-slate-100/60 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="w-24 h-4 bg-slate-300/80 rounded-md animate-pulse" />
                    <div className="w-6 h-4 bg-white rounded-full animate-pulse" />
                  </div>
                  {[1, 2].map((c) => (
                    <div
                      key={c}
                      className="p-3.5 bg-white/80 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-28 h-3.5 bg-slate-300/80 rounded-md animate-pulse" />
                        <div className="w-10 h-4 bg-indigo-100/70 rounded-full animate-pulse" />
                      </div>
                      <div className="w-36 h-3 bg-slate-200/60 rounded-md animate-pulse" />
                      <div className="w-full h-6 bg-slate-100/90 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      );

    case 'super-admin':
      return (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <div className="space-y-1.5">
              <div className="w-56 h-5 bg-slate-300/80 rounded-lg animate-pulse" />
              <div className="w-80 h-3.5 bg-slate-200/60 rounded-md animate-pulse" />
            </div>
            <div className="w-36 h-8 bg-indigo-600/60 rounded-xl animate-pulse" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 bg-white/50 rounded-xl border border-slate-200/60 flex items-center justify-between"
              >
                <div className="w-40 h-4 bg-slate-300/80 rounded-md animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((b) => (
                    <div
                      key={b}
                      className="w-16 h-6 bg-slate-200/70 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
                <div className="w-12 h-6 bg-slate-200/70 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-5 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100/70 mx-auto animate-pulse" />
          <div className="w-48 h-6 bg-slate-300/80 rounded-xl mx-auto animate-pulse" />
          <div className="w-80 h-4 bg-slate-200/60 rounded-lg mx-auto animate-pulse" />
          <div className="p-6 bg-white/50 rounded-2xl border border-slate-200/80 space-y-3 text-left">
            <div className="w-36 h-4 bg-slate-300/80 rounded-md animate-pulse" />
            <div className="w-full h-3 bg-slate-200/60 rounded-md animate-pulse" />
            <div className="w-4/5 h-3 bg-slate-200/60 rounded-md animate-pulse" />
          </div>
        </div>
      );
  }
}
