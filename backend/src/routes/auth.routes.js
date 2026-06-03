import { Router } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../validators/common.js';
import { loginSchema } from '../validators/schemas.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/me', requireAuth, me);
