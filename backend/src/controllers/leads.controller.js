import { Parser } from '@json2csv/plainjs';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { writeAuditLog } from '../utils/audit.js';
import { ownerFilter } from '../utils/visibility.js';

const leadSelect = `
  l.id, l.company_name, l.contact_name, l.email, l.phone, l.source, l.status,
  l.value, l.owner_id, l.expected_close_date, l.notes, l.created_at, l.updated_at,
  u.name AS owner_name, u.email AS owner_email
`;

function normalizeLeadPayload(body, user) {
  return {
    ...body,
    email: body.email || null,
    phone: body.phone || null,
    owner_id: ['admin', 'manager'].includes(user.role) ? body.owner_id || user.id : user.id,
    expected_close_date: body.expected_close_date || null,
    notes: body.notes || null
  };
}

export const listLeads = asyncHandler(async (req, res) => {
  const { status, q } = req.query;
  const visibility = ownerFilter(req.user, 'l');
  const params = [...visibility.params];
  const filters = [visibility.clause];

  if (status) {
    params.push(status);
    filters.push(`l.status = $${params.length}`);
  }

  if (q) {
    params.push(`%${q}%`);
    filters.push(`(l.company_name ILIKE $${params.length} OR l.contact_name ILIKE $${params.length} OR l.email ILIKE $${params.length})`);
  }

  const { rows } = await query(
    `SELECT ${leadSelect}
     FROM leads l
     LEFT JOIN users u ON u.id = l.owner_id
     WHERE ${filters.join(' AND ')}
     ORDER BY l.updated_at DESC`,
    params
  );

  res.json({ data: rows });
});

export const getLead = asyncHandler(async (req, res) => {
  const visibility = ownerFilter(req.user, 'l');
  const { rows } = await query(
    `SELECT ${leadSelect}
     FROM leads l
     LEFT JOIN users u ON u.id = l.owner_id
     WHERE l.id = $${visibility.params.length + 1} AND ${visibility.clause}`,
    [...visibility.params, req.params.id]
  );

  if (!rows[0]) {
    throw httpError(404, 'Lead not found');
  }

  res.json({ data: rows[0] });
});

export const createLead = asyncHandler(async (req, res) => {
  const body = normalizeLeadPayload(req.body, req.user);
  const { rows } = await query(
    `INSERT INTO leads
      (company_name, contact_name, email, phone, source, status, value, owner_id, expected_close_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      body.company_name,
      body.contact_name,
      body.email,
      body.phone,
      body.source,
      body.status,
      body.value,
      body.owner_id,
      body.expected_close_date,
      body.notes
    ]
  );

  await writeAuditLog({
    actorId: req.user.id,
    action: 'created',
    entityType: 'lead',
    entityId: rows[0].id,
    metadata: { company_name: rows[0].company_name, status: rows[0].status }
  });

  res.status(201).json({ data: rows[0] });
});

export const updateLead = asyncHandler(async (req, res) => {
  const visibility = ownerFilter(req.user, 'l');
  const existing = await query(
    `SELECT l.id FROM leads l WHERE l.id = $${visibility.params.length + 1} AND ${visibility.clause}`,
    [...visibility.params, req.params.id]
  );

  if (!existing.rows[0]) {
    throw httpError(404, 'Lead not found');
  }

  const body = normalizeLeadPayload(req.body, req.user);
  const { rows } = await query(
    `UPDATE leads
     SET company_name = $1, contact_name = $2, email = $3, phone = $4, source = $5,
         status = $6, value = $7, owner_id = $8, expected_close_date = $9, notes = $10,
         updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
    [
      body.company_name,
      body.contact_name,
      body.email,
      body.phone,
      body.source,
      body.status,
      body.value,
      body.owner_id,
      body.expected_close_date,
      body.notes,
      req.params.id
    ]
  );

  await writeAuditLog({
    actorId: req.user.id,
    action: 'updated',
    entityType: 'lead',
    entityId: req.params.id,
    metadata: { company_name: rows[0].company_name, status: rows[0].status }
  });

  res.json({ data: rows[0] });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const visibility = ownerFilter(req.user, 'l');
  const { rows } = await query(
    `DELETE FROM leads l
     WHERE l.id = $${visibility.params.length + 1} AND ${visibility.clause}
     RETURNING l.id, l.company_name`,
    [...visibility.params, req.params.id]
  );

  if (!rows[0]) {
    throw httpError(404, 'Lead not found');
  }

  await writeAuditLog({
    actorId: req.user.id,
    action: 'deleted',
    entityType: 'lead',
    entityId: rows[0].id,
    metadata: { company_name: rows[0].company_name }
  });

  res.status(204).send();
});

export const exportLeads = asyncHandler(async (req, res) => {
  const visibility = ownerFilter(req.user, 'l');
  const { rows } = await query(
    `SELECT l.company_name, l.contact_name, l.email, l.phone, l.source, l.status,
            l.value, u.name AS owner_name, l.expected_close_date, l.created_at
     FROM leads l
     LEFT JOIN users u ON u.id = l.owner_id
     WHERE ${visibility.clause}
     ORDER BY l.created_at DESC`,
    visibility.params
  );

  await writeAuditLog({
    actorId: req.user.id,
    action: 'exported',
    entityType: 'lead',
    metadata: { count: rows.length }
  });

  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('leads-report.csv');
  res.send(csv);
});
