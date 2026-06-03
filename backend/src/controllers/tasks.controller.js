import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { writeAuditLog } from '../utils/audit.js';
import { taskFilter } from '../utils/visibility.js';

const taskSelect = `
  t.id, t.title, t.description, t.due_date, t.priority, t.status, t.lead_id,
  t.assigned_to, t.created_by, t.created_at, t.updated_at,
  l.company_name, assignee.name AS assignee_name, creator.name AS creator_name
`;

function normalizeTaskPayload(body, user) {
  return {
    ...body,
    description: body.description || null,
    due_date: body.due_date || null,
    lead_id: body.lead_id || null,
    assigned_to: ['admin', 'manager'].includes(user.role) ? body.assigned_to || user.id : user.id
  };
}

export const listTasks = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const visibility = taskFilter(req.user, 't');
  const params = [...visibility.params];
  const filters = [visibility.clause];

  if (status) {
    params.push(status);
    filters.push(`t.status = $${params.length}`);
  }

  const { rows } = await query(
    `SELECT ${taskSelect}
     FROM tasks t
     LEFT JOIN leads l ON l.id = t.lead_id
     LEFT JOIN users assignee ON assignee.id = t.assigned_to
     LEFT JOIN users creator ON creator.id = t.created_by
     WHERE ${filters.join(' AND ')}
     ORDER BY t.due_date ASC NULLS LAST, t.updated_at DESC`,
    params
  );

  res.json({ data: rows });
});

export const createTask = asyncHandler(async (req, res) => {
  const body = normalizeTaskPayload(req.body, req.user);
  const { rows } = await query(
    `INSERT INTO tasks
      (title, description, due_date, priority, status, lead_id, assigned_to, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      body.title,
      body.description,
      body.due_date,
      body.priority,
      body.status,
      body.lead_id,
      body.assigned_to,
      req.user.id
    ]
  );

  await writeAuditLog({
    actorId: req.user.id,
    action: 'created',
    entityType: 'task',
    entityId: rows[0].id,
    metadata: { title: rows[0].title, assigned_to: rows[0].assigned_to }
  });

  res.status(201).json({ data: rows[0] });
});

export const updateTask = asyncHandler(async (req, res) => {
  const visibility = taskFilter(req.user, 't');
  const existing = await query(
    `SELECT t.id FROM tasks t WHERE t.id = $${visibility.params.length + 1} AND ${visibility.clause}`,
    [...visibility.params, req.params.id]
  );

  if (!existing.rows[0]) {
    throw httpError(404, 'Task not found');
  }

  const body = normalizeTaskPayload(req.body, req.user);
  const { rows } = await query(
    `UPDATE tasks
     SET title = $1, description = $2, due_date = $3, priority = $4, status = $5,
         lead_id = $6, assigned_to = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      body.title,
      body.description,
      body.due_date,
      body.priority,
      body.status,
      body.lead_id,
      body.assigned_to,
      req.params.id
    ]
  );

  await writeAuditLog({
    actorId: req.user.id,
    action: 'updated',
    entityType: 'task',
    entityId: req.params.id,
    metadata: { title: rows[0].title, status: rows[0].status }
  });

  res.json({ data: rows[0] });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const visibility = taskFilter(req.user, 't');
  const { rows } = await query(
    `DELETE FROM tasks t
     WHERE t.id = $${visibility.params.length + 1} AND ${visibility.clause}
     RETURNING t.id, t.title`,
    [...visibility.params, req.params.id]
  );

  if (!rows[0]) {
    throw httpError(404, 'Task not found');
  }

  await writeAuditLog({
    actorId: req.user.id,
    action: 'deleted',
    entityType: 'task',
    entityId: rows[0].id,
    metadata: { title: rows[0].title }
  });

  res.status(204).send();
});
