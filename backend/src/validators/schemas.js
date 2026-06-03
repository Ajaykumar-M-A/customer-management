import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  password: z.string().min(6).max(120),
  role: z.enum(['admin', 'manager', 'sales', 'support'])
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.enum(['admin', 'manager', 'sales', 'support']).optional(),
  is_active: z.boolean().optional()
});

export const leadSchema = z.object({
  company_name: z.string().min(2).max(180),
  contact_name: z.string().min(2).max(140),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(60).optional().nullable(),
  source: z.string().min(2).max(80),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']),
  value: z.coerce.number().min(0),
  owner_id: z.string().uuid().optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const taskSchema = z.object({
  title: z.string().min(2).max(180),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']),
  lead_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable()
});
