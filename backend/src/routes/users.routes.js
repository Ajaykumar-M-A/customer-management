import { Router } from 'express';
import { createUser, listUsers, updateUser } from '../controllers/users.controller.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';
import { validate } from '../validators/common.js';
import { createUserSchema, updateUserSchema } from '../validators/schemas.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.get('/', allowRoles('admin', 'manager'), listUsers);
usersRouter.post('/', allowRoles('admin'), validate(createUserSchema), createUser);
usersRouter.patch('/:id', allowRoles('admin'), validate(updateUserSchema), updateUser);
