import { Response } from 'express';
import { MaintenanceService } from './maintenance.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

export const getMaintenanceRecords = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const records = await MaintenanceService.getAllMaintenance();
    return sendResponse(res, 200, 'Maintenance records retrieved successfully', records);
  }
);

export const createMaintenanceRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { spaceId, startTime, endTime, reason } = req.body;
    const record = await MaintenanceService.createMaintenance(
      spaceId,
      new Date(startTime),
      new Date(endTime),
      reason
    );
    return sendResponse(res, 201, 'Maintenance record created successfully', record);
  }
);

export const getMaintenanceDetail = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const record = await MaintenanceService.getMaintenanceById(id);
    return sendResponse(res, 200, 'Maintenance details retrieved successfully', record);
  }
);

export const deleteMaintenanceRecord = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    await MaintenanceService.deleteMaintenance(id);
    return sendResponse(res, 200, 'Maintenance record deleted successfully');
  }
);
