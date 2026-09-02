import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Fingerprint,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar as CalendarIcon,
  XCircle,
  Plus,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { AttendanceRecord, Geofence } from '../../types';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { PrototypeDisclaimer } from '../common/PrototypeDisclaimer';
import { formatDistance, isPointInsideGeofence } from '../../utils/geo';
import confetti from 'canvas-confetti';

export const AttendanceModuleView: React.FC = () => {
  const {
    currentOrg,
    employees,
    attendanceRecords,
    clockIn,
    clockOut,
    todayUserRecord,
    approveRegularization,
    rejectRegularization,
    addGeofence,
    activeSubTab,
    setActiveSubTab,
    setIsFieldStaffModalOpen,
  } = useHrms();

  const [isPunching, setIsPunching] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState<{
    success: boolean;
    message: string;
    distance?: string;
  } | null>(null);

  // New Geofence Modal
  const [isAddGeoModalOpen, setIsAddGeoModalOpen] = useState(false);
  const [geoName, setGeoName] = useState('');
  const [geoLat, setGeoLat] = useState(12.9260);
  const [geoLng, setGeoLng] = useState(77.6830);
  const [geoRadius, setGeoRadius] = useState(350);
  const [geoPolicy, setGeoPolicy] = useState<'Strict Block' | 'Allow with Warning' | 'Manager Approval Required'>('Allow with Warning');

  const defaultGeo = currentOrg.geofences[0] || {
    id: 'geo-main',
    name: 'Main HQ',
    latitude: 12.9260,
    longitude: 77.6830,
    radiusMeters: 350,
    policy: 'Allow with Warning',
  };

  // KPIs
  const presentCount = attendanceRecords.filter((a) => a.status === 'Present').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'Late').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'Absent').length;

  const handleBrowserClockIn = () => {
    setIsPunching(true);
    setPunchFeedback(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const res = clockIn({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            isBiometricSimulated: false,
          });

          setIsPunching(false);
          setPunchFeedback({
            success: res.success,
            message: res.message,
            distance: res.distanceMeters ? formatDistance(res.distanceMeters) : undefined,
          });

          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
          });
        },
        (err) => {
          // Fallback to mock inside coordinates if browser location denied
          const res = clockIn({
            latitude: defaultGeo.latitude + 0.0002,
            longitude: defaultGeo.longitude + 0.0001,
            accuracy: 15,
            isBiometricSimulated: false,
          });

          setIsPunching(false);
          setPunchFeedback({
            success: res.success,
            message: `${res.message} (Simulated coords used since browser GPS was restricted)`,
            distance: '24 m',
          });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      // Fallback
      const res = clockIn({
        latitude: defaultGeo.latitude,
        longitude: defaultGeo.longitude,
        accuracy: 10,
      });
      setIsPunching(false);
      setPunchFeedback({ success: res.success, message: res.message });
    }
  };

  const handleCreateGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geoName.trim()) return;

    addGeofence({
      name: geoName,
      latitude: Number(geoLat),
      longitude: Number(geoLng),
      radiusMeters: Number(geoRadius),
      policy: geoPolicy,
    });

    setIsAddGeoModalOpen(false);
    setGeoName('');
  };

  return (
    <div id="attendance-module-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header & SubNav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Attendance & Geofencing System
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-md">
              {currentOrg.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric & GPS mobile check-ins, office perimeter validation, and regularization approvals.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/50 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'logs'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Logs & Map
          </button>
          <button
            onClick={() => setActiveSubTab('geofences')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'geofences'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Geofence Policies ({currentOrg.geofences.length})
          </button>
          <button
            onClick={() => setActiveSubTab('regularization')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'regularization'
                ? 'bg-white/95 text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regularization Approvals
          </button>
        </div>
      </div>

      <PrototypeDisclaimer
        type="geolocation"
        customText="Self-reported device geolocation only. Location is self-reported by browser APIs and not independently verified. In production, tamper-proof hardware beacons and IP verification are used."
      />

      {/* ========================================================================= */}
      {/* 1. ATTENDANCE DASHBOARD & CLOCK-IN PUNCH CARD */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              id="kpi-present-today"
              title="Present Today"
              value={presentCount}
              subtitle="Inside perimeter"
              trend="up"
              icon={CheckCircle2}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50/80"
            />
            <KpiCard
              id="kpi-late-today"
              title="Late Arrivals"
              value={lateCount}
              subtitle="Punched after 09:45"
              trend="neutral"
              icon={Clock}
              iconColor="text-amber-600"
              iconBg="bg-amber-50/80"
            />
            <KpiCard
              id="kpi-absent-today"
              title="Absent / On Leave"
              value={absentCount}
              subtitle="Out of office"
              trend="neutral"
              icon={XCircle}
              iconColor="text-rose-600"
              iconBg="bg-rose-50/80"
            />
            <KpiCard
              id="kpi-adherence"
              title="Perimeter Adherence"
              value="94.2%"
              subtitle="Geofence compliance"
              trend="up"
              icon={MapPin}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50/80"
            />
          </div>

          {/* Interactive Clock-In / Out Card */}
          <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Live Attendance Punch Terminal
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-heading mt-0.5">
                  Logged in as: Aarav Patel (Engineering)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Active Geofence: <strong>{defaultGeo.name}</strong> ({defaultGeo.radiusMeters}m radius) • Policy: {defaultGeo.policy}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!todayUserRecord?.clockInTime ? (
                  <button
                    onClick={handleBrowserClockIn}
                    disabled={isPunching}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50 transition-all transform active:scale-95"
                  >
                    <MapPin className="w-4 h-4" />
                    {isPunching ? 'Acquiring GPS & Punching...' : 'Punch In with GPS'}
                  </button>
                ) : !todayUserRecord?.clockOutTime ? (
                  <button
                    onClick={clockOut}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all transform active:scale-95"
                  >
                    <Clock className="w-4 h-4" />
                    Clock Out ({todayUserRecord.clockInTime})
                  </button>
                ) : (
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50/90 px-4 py-2 rounded-xl border border-emerald-200">
                    Shift Completed Today (9.2 hrs logged)
                  </div>
                )}

                <button
                  onClick={() => setIsFieldStaffModalOpen(true)}
                  className="px-4 py-3 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-colors shadow-2xs backdrop-blur-xs"
                >
                  Simulate Field Mobile App
                </button>
              </div>
            </div>

            {/* Punch Feedback Alert */}
            {punchFeedback && (
              <div
                className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
                  punchFeedback.success
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/90 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{punchFeedback.message}</span>
                </div>
                {punchFeedback.distance && (
                  <span className="font-bold font-mono">
                    Distance: {punchFeedback.distance}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DAILY LOGS & LEAFLET MAP VISUALIZER */}
      {/* ========================================================================= */}
      {activeSubTab === 'logs' && (
        <div className="space-y-6">
          {/* Visual Geofence Map Demonstration Card */}
          <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-1 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              HQ Office Perimeter & Active Punch Telemetry
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Geofence Center: {defaultGeo.latitude.toFixed(4)}° N, {defaultGeo.longitude.toFixed(4)}° E • Allowed Radius: {defaultGeo.radiusMeters}m
            </p>

            {/* Styled Map Container */}
            <div className="h-64 w-full bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center p-4 border border-slate-800">
              {/* Radar Grid Graphic */}
              <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* Geofence Perimeter Ring */}
              <div className="relative w-48 h-48 rounded-full border-2 border-dashed border-emerald-400 bg-emerald-500/10 flex items-center justify-center animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/40" />
                <span className="absolute -top-5 text-[10px] font-bold text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded-full">
                  {defaultGeo.name} ({defaultGeo.radiusMeters}m)
                </span>
              </div>

              {/* Simulated Punch Pins */}
              <div className="absolute top-24 left-1/3 p-1 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 text-white" title="Punched: Inside">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="absolute bottom-16 right-1/4 p-1 rounded-full bg-amber-500 ring-4 ring-amber-500/20 text-white" title="Punched: Outside (Client site)">
                <MapPin className="w-3.5 h-3.5" />
              </div>

              <div className="absolute bottom-3 left-4 text-[11px] text-slate-300 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Inside Geofence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Outside Perimeter (Warn/Flag)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Logs Table */}
          <DataTable<AttendanceRecord>
            data={attendanceRecords}
            exportFilename={`Attendance_${currentOrg.slug}`}
            title="Daily Attendance & Punch Records"
            subtitle="Verified daily check-ins, punch timestamps, self-reported GPS coordinates, and geofence verification status."
            searchPlaceholder="Search employee name or status..."
            columns={[
              {
                header: 'Employee Name',
                accessorKey: 'employeeName',
                sortable: true,
                cell: (row: AttendanceRecord) => (
                  <div className="font-bold text-slate-900">
                    {row.employeeName}
                  </div>
                ),
              },
              {
                header: 'Date',
                accessorKey: 'date',
                className: 'font-mono text-slate-500',
              },
              {
                header: 'Clock In',
                accessorKey: 'clockInTime',
                cell: (row: AttendanceRecord) => (
                  <span className="font-bold text-slate-800">
                    {row.clockInTime || '—'}
                  </span>
                ),
              },
              {
                header: 'Clock Out',
                accessorKey: 'clockOutTime',
                cell: (row: AttendanceRecord) => (
                  <span className="text-slate-600">
                    {row.clockOutTime || '—'}
                  </span>
                ),
              },
              {
                header: 'Work Hours',
                accessorKey: 'workHours',
                cell: (row: AttendanceRecord) => (
                  <span className="font-semibold text-indigo-700">
                    {row.workHours ? `${row.workHours} hrs` : '—'}
                  </span>
                ),
              },
              {
                header: 'Perimeter Check',
                cell: (row: AttendanceRecord) => <StatusBadge status={row.geofenceStatus || 'Inside Allowed Location'} size="sm" />,
              },
              {
                header: 'Status',
                cell: (row: AttendanceRecord) => <StatusBadge status={row.status} size="sm" />,
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GEOFENCE POLICY CONFIGURATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'geofences' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Configured Worksite Geofences
              </h3>
              <p className="text-xs text-slate-500">
                Define geographic latitude/longitude boundaries and enforcement policies for employee punch validation.
              </p>
            </div>
            <button
              onClick={() => setIsAddGeoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Geofence
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentOrg.geofences.map((geo) => (
              <div
                key={geo.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-heading">
                        {geo.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {geo.latitude.toFixed(4)}° N, {geo.longitude.toFixed(4)}° E
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                    {geo.radiusMeters}m Radius
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Enforcement Policy:</span>
                  <span className="font-bold text-slate-800">{geo.policy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. REGULARIZATION APPROVALS */}
      {/* ========================================================================= */}
      {activeSubTab === 'regularization' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Pending Regularization Requests
            </h3>
            <p className="text-xs text-slate-500">
              Review and approve missed punches or remote client site attendance exceptions.
            </p>

            <div className="divide-y divide-slate-100">
              <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Rohan Verma
                    </span>
                    <span className="text-xs text-slate-500">• 2026-08-28</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded">
                      Client Meeting
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    "Onsite client architectural review meeting at Whitefield Tech Park. Unable to punch inside HQ."
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveRegularization('reg-1')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Approve Exception
                  </button>
                  <button
                    onClick={() => rejectRegularization('reg-1')}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Geofence Modal */}
      <Modal
        isOpen={isAddGeoModalOpen}
        onClose={() => setIsAddGeoModalOpen(false)}
        title="Add Worksite Geofence Boundary"
        subtitle="Registers a geographic coordinate perimeter for attendance validation."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddGeoModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateGeofence}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Save Geofence
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateGeofence} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Geofence Name *
            </label>
            <input
              type="text"
              required
              value={geoName}
              onChange={(e) => setGeoName(e.target.value)}
              placeholder="e.g. Hyderabad Innovation Centre"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Latitude (Deg)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={geoLat}
                onChange={(e) => setGeoLat(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Longitude (Deg)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={geoLng}
                onChange={(e) => setGeoLng(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Allowed Radius (Meters)
              </label>
              <input
                type="number"
                required
                value={geoRadius}
                onChange={(e) => setGeoRadius(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enforcement Policy
              </label>
              <select
                value={geoPolicy}
                onChange={(e: any) => setGeoPolicy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="Allow with Warning">Allow with Warning Flag</option>
                <option value="Strict Block">Strict Block (Prevent Punch)</option>
                <option value="Manager Approval Required">Manager Approval Required</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
