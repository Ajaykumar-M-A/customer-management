import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

export const auditRouter = Router();

auditRouter.get('/', requireAuth, allowRoles('admin', 'manager'), listAuditLogs);
