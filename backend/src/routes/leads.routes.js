import { Router } from 'express';
import {
  createLead,
  deleteLead,
  exportLeads,
  getLead,
  listLeads,
  updateLead
} from '../controllers/leads.controller.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { validate } from '../validators/common.js';
import { leadSchema } from '../validators/schemas.js';

export const leadsRouter = Router();

leadsRouter.use(requireAuth);
leadsRouter.get('/', listLeads);
leadsRouter.get('/export', allowRoles('admin', 'manager'), exportLeads);
leadsRouter.get('/:id', getLead);
leadsRouter.post('/', allowRoles('admin', 'manager', 'sales'), validate(leadSchema), createLead);
leadsRouter.put('/:id', allowRoles('admin', 'manager', 'sales'), validate(leadSchema), updateLead);
leadsRouter.delete('/:id', allowRoles('admin', 'manager'), deleteLead);
