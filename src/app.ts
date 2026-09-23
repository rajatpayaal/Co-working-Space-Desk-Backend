import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { setupSwagger } from './config/swagger.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { globalErrorHandler } from './middleware/errorHandler.middleware.js';
import { AppError } from './utils/appError.js';

// Feature Module Routers
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import rolesRoutes from './modules/roles/roles.routes.js';
import permissionsRoutes from './modules/permissions/permissions.routes.js';
import spacesRoutes, { adminRouter as adminSpacesRouter } from './modules/spaces/spaces.routes.js';
import availabilityRoutes from './modules/availability/availability.routes.js';
import bookingsRoutes, { adminBookingsRouter } from './modules/bookings/bookings.routes.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

dotenv.config();

const app: Express = express();

// Global Middlewares
app.use(helmet({ contentSecurityPolicy: false }));

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://co-working-space-desk-backend.vercel.app',
];
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize Swagger documentation at /api-docs
setupSwagger(app);

// Root Landing Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Co-working Space Desk Reservation API',
    productionUrl: 'https://co-working-space-desk-backend.vercel.app',
    documentation: '/api-docs',
    health: '/health',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Coworking Space Backend API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount Feature Modules Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/admin/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/admin/permissions', permissionsRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/admin', adminSpacesRouter);
app.use('/api/admin', adminBookingsRouter);
app.use('/api', availabilityRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api', bookingsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/admin/maintenance', maintenanceRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Handle Unhandled Routes
app.use((req: Request, _res: Response, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized Global Error Handler
app.use(globalErrorHandler);

export default app;
