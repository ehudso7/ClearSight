/**
 * Zod validation schemas for API endpoints
 */
import { z } from 'zod';

/**
 * Generate Daily Report
 */
export const generateReportSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

/**
 * CSV Upload
 */
export const csvUploadSchema = z.object({
  dataType: z.enum(['sales', 'warehouse', 'staff', 'support', 'finance', 'mixed']),
});

/**
 * Send Report Email
 */
export const sendEmailSchema = z.object({
  reportId: z.string().uuid('Invalid report ID'),
  clientId: z.string().uuid('Invalid client ID'),
});

/**
 * Create Client (Admin)
 */
export const createClientSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  contact_name: z.string().max(100).optional().nullable(),
  contact_email: z.string().email('Invalid email address'),
  subscription_tier: z.enum(['starter', 'pro', 'enterprise']).default('starter'),
});

/**
 * n8n Webhook
 */
export const webhookAuthSchema = z.object({
  authorization: z.string().startsWith('Bearer ', 'Invalid authorization format'),
});

/**
 * Validate request body with schema
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: message };
    }
    return { success: false, error: 'Validation failed' };
  }
}
