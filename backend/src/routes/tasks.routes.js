import { Router } from 'express';
import { createTask, deleteTask, listTasks, updateTask } from '../controllers/tasks.controller.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { validate } from '../validators/common.js';
import { taskSchema } from '../validators/schemas.js';

export const tasksRouter = Router();

tasksRouter.use(requireAuth);
tasksRouter.get('/', listTasks);
tasksRouter.post('/', allowRoles('admin', 'manager', 'sales'), validate(taskSchema), createTask);
tasksRouter.put('/:id', allowRoles('admin', 'manager', 'sales', 'support'), validate(taskSchema), updateTask);
tasksRouter.delete('/:id', allowRoles('admin', 'manager'), deleteTask);
