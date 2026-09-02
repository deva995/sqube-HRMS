import React, { useState } from 'react';
import {
  Smartphone,
  Fingerprint,
  MapPin,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { formatDistance } from '../../utils/geo';
import confetti from 'canvas-confetti';

export const FieldStaffMobileModal: React.FC = () => {
  const {
    isFieldStaffModalOpen,
    setIsFieldStaffModalOpen,
    currentOrg,
    clockIn,
    clockOut,
    todayUserRecord,
    isOfflineMode,
    toggleOfflineMode,
    syncOfflineQueue,
    offlineSyncQueue,
  } = useHrms();

  const [simulatedLocationMode, setSimulatedLocationMode] = useState<'inside' | 'outside' | 'remote'>('inside');
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [punchResult, setPunchResult] = useState<{
    success: boolean;
    message: string;
    status: string;
  } | null>(null);

  if (!isFieldStaffModalOpen) return null;

  const currentGeo = currentOrg.geofences[0] || {
    latitude: 12.9260,
    longitude: 77.6830,
    radiusMeters: 350,
    name: 'Main HQ',
  };

  // Compute test coords
  let testLat = currentGeo.latitude;
  let testLng = currentGeo.longitude;

  if (simulatedLocationMode === 'outside') {
    testLat += 0.018; // ~2 km away
    testLng += 0.015;
  } else if (simulatedLocationMode === 'remote') {
    testLat += 0.08; // ~9 km away
    testLng += 0.06;
  }

  const handleSimulateBiometricPunch = () => {
    setIsScanningFingerprint(true);
    setPunchResult(null);

    setTimeout(() => {
      setIsScanningFingerprint(false);
      const res = clockIn({
        latitude: testLat,
        longitude: testLng,
        accuracy: 10,
        isBiometricSimulated: true,
      });

      setPunchResult({
        success: res.success,
        message: res.message,
        status: res.geofenceStatus,
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 1200);
  };

  return (
    <div
      id="field-staff-mobile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="fixed inset-0"
        onClick={() => setIsFieldStaffModalOpen(false)}
      />

      <div className="relative z-10 max-w-sm w-full bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-4 border-slate-700">
        {/* Phone Notch & Speaker */}
        <div className="flex justify-between items-center px-6 pt-2 pb-1 text-slate-400 text-xs">
          <span>09:41</span>
          <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto -mt-1 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 mr-2" />
            <div className="w-8 h-1 bg-slate-700 rounded-full" />
          </div>
          <div className="flex items-center gap-1.5">
            {isOfflineMode ? (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-[10px] font-bold">5G</span>
          </div>
        </div>

        {/* Screen Content */}
        <div className="bg-slate-50 rounded-[2.25rem] p-5 text-slate-900 min-h-[580px] flex flex-col justify-between overflow-hidden relative">
          {/* Close button top right */}
          <button
            onClick={() => setIsFieldStaffModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            {/* App Header inside phone */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                SQ
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                  Sqbe Mobile Staff
                </h4>
                <p className="text-[11px] text-slate-500">
                  {currentOrg.name}
                </p>
              </div>
            </div>

            {/* Offline Mode Banner */}
            <div
              onClick={toggleOfflineMode}
              className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer mb-3 border transition-colors ${
                isOfflineMode
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {isOfflineMode ? (
                  <WifiOff className="w-4 h-4 text-rose-600" />
                ) : (
                  <Wifi className="w-4 h-4 text-emerald-600" />
                )}
                <div>
                  <div className="font-bold text-[11px]">
                    {isOfflineMode ? 'Offline Mode Active' : 'Online Central Sync'}
                  </div>
                  <div className="text-[10px] opacity-80">
                    {isOfflineMode
                      ? `${offlineSyncQueue.length} punches queued for sync`
                      : 'Real-time telemetry streaming'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold underline">
                {isOfflineMode ? 'Go Online' : 'Simulate Offline'}
              </span>
            </div>

            {/* Simulated Location Selector */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs mb-3">
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                Simulate Field Location:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSimulatedLocationMode('inside')}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    simulatedLocationMode === 'inside'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Inside HQ (30m)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedLocationMode('outside')}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    simulatedLocationMode === 'outside'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Client Site (2km)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedLocationMode('remote')}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    simulatedLocationMode === 'remote'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Remote (9km)
                </button>
              </div>
            </div>

            {/* Today status summary */}
            <div className="bg-indigo-900 text-white p-3.5 rounded-2xl shadow-md mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] text-indigo-200">Current Shift</span>
                <span className="text-[10px] bg-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  09:30 - 18:30
                </span>
              </div>
              <div className="text-xl font-bold font-heading">
                {todayUserRecord?.clockInTime ? `Punched: ${todayUserRecord.clockInTime}` : 'Not Clocked In'}
              </div>
              <p className="text-[11px] text-indigo-300 mt-0.5">
                Staff: Aarav Patel (Senior Developer)
              </p>
            </div>

            {/* Punch Result feedback */}
            {punchResult && (
              <div
                className={`p-3 rounded-xl border text-xs mb-3 flex items-start gap-2 ${
                  punchResult.status === 'Inside Allowed Location'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {punchResult.status === 'Inside Allowed Location' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-[11px]">{punchResult.status}</div>
                  <div className="text-[10px]">{punchResult.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Biometric Trigger Area */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleSimulateBiometricPunch}
              disabled={isScanningFingerprint}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                isScanningFingerprint
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white hover:shadow-indigo-500/25'
              }`}
            >
              <Fingerprint className="w-9 h-9" />
            </button>
            <span className="text-[11px] font-bold text-slate-700 mt-2">
              {isScanningFingerprint ? 'Verifying Biometrics...' : 'Touch Fingerprint to Punch'}
            </span>
            <span className="text-[9px] text-slate-400 text-center mt-0.5">
              Simulated FIDO2 biometric verification + Geo check
            </span>

            {/* Offline sync button if items queued */}
            {offlineSyncQueue.length > 0 && (
              <button
                onClick={syncOfflineQueue}
                className="mt-3 w-full py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync {offlineSyncQueue.length} Offline Punches
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
