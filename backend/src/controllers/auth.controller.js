import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { writeAuditLog } from '../utils/audit.js';

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await query(
    'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  const user = rows[0];

  if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
    throw httpError(401, 'Invalid email or password');
  }

  await writeAuditLog({
    actorId: user.id,
    action: 'login',
    entityType: 'user',
    entityId: user.id
  });

  const { password_hash: _passwordHash, ...safeUser } = user;
  res.json({ token: signToken(user), user: safeUser });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
