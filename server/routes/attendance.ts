import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, AppError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { requireModule } from '../middleware/moduleCheck';
import { getRepository } from '../db/repository';
import { verifyGeofencePunch } from '../services/geofence';
import { logAuditEvent } from '../services/audit';
import { AttendanceRecord } from '../../src/types';

const router = Router();

router.use(authenticate);
router.use(requireModule('attendance'));

const ClockInSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  accuracyMeters: z.number().default(10),
  timestamp: z.string().optional(),
  deviceInfo: z.string().optional(),
  employeeId: z.string().optional(),
});

const ClockOutSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timestamp: z.string().optional(),
  employeeId: z.string().optional(),
});

const RegularizationSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  date: z.string(),
  reason: z.string().min(5),
  requestedClockIn: z.string().optional(),
  requestedClockOut: z.string().optional(),
});

/**
 * POST /api/v1/attendance/clock-in
 * Authoritative Server-Side Geofence Verification & Clock-In
 */
router.post('/clock-in', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { latitude, longitude, accuracyMeters, timestamp, deviceInfo, employeeId } = ClockInSchema.parse(req.body);

    const repo = getRepository(req.user?.orgId, req.user?.role);
    
    // Prevent non-admins from punching for others
    const isAdminOrHr = ['Admin', 'Super Admin', 'HR Manager', 'Org Admin'].includes(req.user?.role || '');
    let targetEmployeeId = req.user?.employeeId || 'emp-acro-104';
    if (isAdminOrHr && employeeId) {
      targetEmployeeId = employeeId;
    } else if (employeeId && employeeId !== req.user?.employeeId && !isAdminOrHr) {
      throw new AppError('Forbidden: Regular employees cannot punch attendance on behalf of another employee.', 403, 'IMPERSONATION_FORBIDDEN');
    }

    const employee = await repo.getEmployeeById(targetEmployeeId);
    if (!employee) {
      throw new AppError('Employee profile not associated with this user session.', 404);
    }

    const orgGeofences = await repo.getGeofences();
    const effectiveTimestamp = timestamp || new Date().toISOString();

    // Run authoritative server-side Haversine & Drift verification
    const verification = verifyGeofencePunch(
      latitude,
      longitude,
      accuracyMeters,
      effectiveTimestamp,
      orgGeofences
    );

    if (verification.policyVerdict === 'Blocked') {
      throw new AppError(
        `Punch blocked: You are ${verification.distanceMeters}m away from the authorized office perimeter (${verification.matchedGeofence?.name}). Geofence policy does not permit remote punches.`,
        403,
        'GEOFENCE_PUNCH_BLOCKED',
        { distanceMeters: verification.distanceMeters, allowedRadius: verification.matchedGeofence?.radiusMeters }
      );
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const record: AttendanceRecord = {
      id: `att-${employee.id}-${dateStr}`,
      orgId: employee.orgId,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
      department: employee.department,
      date: dateStr,
      clockInTime: timeStr,
      workHours: 8.0,
      totalWorkingHours: 8.0,
      status: 'Present',
      geofenceStatus: verification.statusText,
      punchLocation: {
        latitude,
        longitude,
        accuracyMeters,
        distanceFromOfficeMeters: verification.distanceMeters,
        officeGeofenceName: verification.matchedGeofence?.name || 'Default HQ',
        geofenceStatus: verification.statusText,
        deviceInfo: deviceInfo || 'Web ESS Browser Client',
      },
      withinGeofence: verification.withinGeofence,
      distanceMeters: verification.distanceMeters,
      verifiedAt: verification.verifiedAt,
    };

    const savedRecord = await repo.recordAttendancePunch(record);

    await logAuditEvent(req, {
      action: 'ATTENDANCE_CLOCK_IN',
      module: 'attendance',
      recordName: `${employee.firstName} ${employee.lastName} (${verification.statusText}, ${verification.distanceMeters}m)`,
    });

    res.json({
      success: true,
      data: {
        attendanceRecord: savedRecord,
        verification: {
          withinGeofence: verification.withinGeofence,
          distanceMeters: verification.distanceMeters,
          matchedGeofence: verification.matchedGeofence,
          verifiedAt: verification.verifiedAt,
          statusText: verification.statusText,
          policyVerdict: verification.policyVerdict,
          disclaimer:
            'Server-side verified: Great-circle Haversine computation executed authoritatively on server. Note: Client device GPS hardware claims are subject to OS accuracy and device configuration.',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/attendance/clock-out
 * Clock out endpoint for closing active shift attendance
 */
router.post('/clock-out', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { timestamp, employeeId } = ClockOutSchema.parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const isAdminOrHr = ['Admin', 'Super Admin', 'HR Manager', 'Org Admin'].includes(req.user?.role || '');
    let targetEmployeeId = req.user?.employeeId || 'emp-acro-104';
    if (isAdminOrHr && employeeId) {
      targetEmployeeId = employeeId;
    } else if (employeeId && employeeId !== req.user?.employeeId && !isAdminOrHr) {
      throw new AppError('Forbidden: Regular employees cannot punch attendance on behalf of another employee.', 403, 'IMPERSONATION_FORBIDDEN');
    }

    const employee = await repo.getEmployeeById(targetEmployeeId);
    if (!employee) {
      throw new AppError('Employee profile not found.', 404);
    }

    const now = timestamp ? new Date(timestamp) : new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const todayRecords = await repo.getAttendanceRecords(dateStr);
    const activePunch = todayRecords.find((r) => r.employeeId === employee.id);

    if (!activePunch || !activePunch.clockInTime) {
      throw new AppError('No active clock-in found for today. Please clock in before clocking out.', 400, 'NO_ACTIVE_CLOCK_IN');
    }

    let workHours = 8.0;
    try {
      const inParts = activePunch.clockInTime.split(':').map(Number);
      const outParts = timeStr.split(':').map(Number);
      const inMinutes = inParts[0] * 60 + inParts[1];
      const outMinutes = outParts[0] * 60 + outParts[1];
      if (outMinutes > inMinutes) {
        workHours = Math.round(((outMinutes - inMinutes) / 60) * 10) / 10;
      }
    } catch {
      workHours = 8.0;
    }

    const updated = await repo.recordAttendancePunch({
      ...activePunch,
      clockOutTime: timeStr,
      workHours,
      totalWorkingHours: workHours,
      status: 'Present',
    });

    await logAuditEvent(req, {
      action: 'ATTENDANCE_CLOCK_OUT',
      module: 'attendance',
      recordName: `${employee.firstName} ${employee.lastName} (Clocked out at ${timeStr})`,
    });

    res.json({
      success: true,
      data: {
        attendanceRecord: updated,
        message: 'Clock-out recorded successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/attendance/records
 */
router.get('/records', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const date = req.query.date as string | undefined;
    const records = await repo.getAttendanceRecords(date);

    res.json({
      success: true,
      data: records,
      meta: { total: records.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/attendance/geofences
 */
router.get('/geofences', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const geofences = await repo.getGeofences();

    res.json({
      success: true,
      data: geofences,
      meta: { total: geofences.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/attendance/regularizations
 */
router.get('/regularizations', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const regularizations = await repo.getRegularizations();

    res.json({
      success: true,
      data: regularizations,
      meta: { total: regularizations.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/attendance/regularizations
 */
router.post('/regularizations', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parsed = RegularizationSchema.parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const created = await repo.createRegularization({
      ...parsed,
      status: 'Pending',
    });

    await logAuditEvent(req, {
      action: 'SUBMIT_REGULARIZATION_REQUEST',
      module: 'attendance',
      recordName: `${parsed.employeeName} for ${parsed.date}`,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/attendance/regularizations/:id/status
 */
router.patch(
  '/regularizations/:id/status',
  requireRole(['Admin', 'HR Manager', 'Manager', 'Team Lead', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { status } = z.object({ status: z.enum(['Approved', 'Rejected']) }).parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);

      const updated = await repo.updateRegularizationStatus(req.params.id, status, req.user?.name || 'Manager');

      await logAuditEvent(req, {
        action: `REGULARIZATION_${status.toUpperCase()}`,
        module: 'attendance',
        recordName: `Request ${req.params.id}`,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
