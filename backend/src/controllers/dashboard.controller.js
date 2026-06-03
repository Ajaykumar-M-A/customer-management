import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ownerFilter, taskFilter } from '../utils/visibility.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const leadVisibility = ownerFilter(req.user, 'l');
  const taskVisibility = taskFilter(req.user, 't');

  const [summary, pipeline, tasks, recent] = await Promise.all([
    query(
      `SELECT
        COUNT(*)::int AS total_leads,
        COALESCE(SUM(value), 0)::float AS pipeline_value,
        COALESCE(SUM(value) FILTER (WHERE status = 'won'), 0)::float AS won_value,
        COUNT(*) FILTER (WHERE status = 'won')::int AS won_leads
       FROM leads l
       WHERE ${leadVisibility.clause}`,
      leadVisibility.params
    ),
    query(
      `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(value), 0)::float AS value
       FROM leads l
       WHERE ${leadVisibility.clause}
       GROUP BY status
       ORDER BY status`,
      leadVisibility.params
    ),
    query(
      `SELECT
        COUNT(*) FILTER (WHERE status IN ('todo', 'in_progress'))::int AS open_tasks,
        COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('done', 'cancelled'))::int AS overdue_tasks
       FROM tasks t
       WHERE ${taskVisibility.clause}`,
      taskVisibility.params
    ),
    query(
      `SELECT a.id, a.action, a.entity_type, a.entity_id, a.metadata, a.created_at,
              u.name AS actor_name
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.actor_id
       ORDER BY a.created_at DESC
       LIMIT 8`
    )
  ]);

  res.json({
    summary: {
      ...summary.rows[0],
      ...tasks.rows[0]
    },
    pipeline: pipeline.rows,
    recentActivity: recent.rows
  });
});
