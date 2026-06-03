import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { writeAuditLog } from '../utils/audit.js';

const safeUserSelect = 'id, name, email, role, is_active, created_at, updated_at';

export const listUsers = asyncHandler(async (_req, res) => {
  const { rows } = await query(
    `SELECT ${safeUserSelect} FROM users ORDER BY created_at DESC`
  );
  res.json({ data: rows });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${safeUserSelect}`,
    [name, email.toLowerCase(), hash, role]
  );

  await writeAuditLog({
    actorId: req.user.id,
    action: 'created',
    entityType: 'user',
    entityId: rows[0].id,
    metadata: { email: rows[0].email, role }
  });

  res.status(201).json({ data: rows[0] });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fields = ['name', 'role', 'is_active'].filter((field) => req.body[field] !== undefined);

  if (!fields.length) {
    throw httpError(400, 'No fields provided for update');
  }

  const assignments = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = fields.map((field) => req.body[field]);
  const { rows } = await query(
    `UPDATE users
     SET ${assignments}, updated_at = NOW()
     WHERE id = $${fields.length + 1}
     RETURNING ${safeUserSelect}`,
    [...values, id]
  );

  if (!rows[0]) {
    throw httpError(404, 'User not found');
  }

  await writeAuditLog({
    actorId: req.user.id,
    action: 'updated',
    entityType: 'user',
    entityId: id,
    metadata: req.body
  });

  res.json({ data: rows[0] });
});
