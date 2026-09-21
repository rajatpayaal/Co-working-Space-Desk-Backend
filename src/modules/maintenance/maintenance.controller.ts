import { Response } from 'express';
import { MaintenanceService } from './maintenance.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// 29. GET /api/admin/maintenance
export const getMaintenanceRecords = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const spaceId = req.query.spaceId as string | undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await MaintenanceService.getAllMaintenance({ spaceId, page, limit });
    return sendResponse(res, 200, 'Maintenance records retrieved successfully', result);
  }
);

// 30. POST /api/admin/maintenance
export const createMaintenanceRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { spaceId, startTime, endTime, reason } = req.body;
    const record = await MaintenanceService.createMaintenance(
      spaceId,
      new Date(startTime),
      new Date(endTime),
      reason
    );
    return sendResponse(res, 201, 'Maintenance window created successfully', record);
  }
);

// 31. GET /api/admin/maintenance/:id
export const getMaintenanceDetail = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const record = await MaintenanceService.getMaintenanceById(id);
    return sendResponse(res, 200, 'Maintenance details retrieved successfully', record);
  }
);

// 32. PATCH /api/admin/maintenance/:id
export const updateMaintenanceRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const { startTime, endTime, reason } = req.body;

    const record = await MaintenanceService.updateMaintenance(id, {
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      reason,
    });

    return sendResponse(res, 200, 'Maintenance window updated successfully', record);
  }
);

// 33. DELETE /api/admin/maintenance/:id
export const deleteMaintenanceRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    await MaintenanceService.deleteMaintenance(id);
    return sendResponse(res, 200, 'Maintenance window deleted successfully');
  }
);
