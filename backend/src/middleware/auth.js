import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw httpError(401, 'Authentication token is required');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const { rows } = await query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [payload.sub]
    );

    if (!rows[0] || !rows[0].is_active) {
      throw httpError(401, 'User is not active');
    }

    req.user = rows[0];
    next();
  } catch (error) {
    next(error.status ? error : httpError(401, 'Invalid or expired token'));
  }
}

export function allowRoles(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(httpError(403, 'You do not have permission to perform this action'));
    }
    return next();
  };
}
