import { query } from '../config/db.js';

export async function writeAuditLog({ actorId, action, entityType, entityId = null, metadata = {} }) {
  await query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [actorId, action, entityType, entityId, JSON.stringify(metadata)]
  );
}
