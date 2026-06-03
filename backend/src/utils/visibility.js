export function ownerFilter(user, alias = '') {
  const prefix = alias ? `${alias}.` : '';
  if (['admin', 'manager'].includes(user.role)) {
    return { clause: 'TRUE', params: [] };
  }
  if (user.role === 'support') {
    return {
      clause: `(${prefix}owner_id = $1 OR EXISTS (
        SELECT 1 FROM tasks t
        WHERE t.lead_id = ${prefix}id AND t.assigned_to = $1
      ))`,
      params: [user.id]
    };
  }
  return { clause: `${prefix}owner_id = $1`, params: [user.id] };
}

export function taskFilter(user, alias = '') {
  const prefix = alias ? `${alias}.` : '';
  if (['admin', 'manager'].includes(user.role)) {
    return { clause: 'TRUE', params: [] };
  }
  return { clause: `${prefix}assigned_to = $1`, params: [user.id] };
}
