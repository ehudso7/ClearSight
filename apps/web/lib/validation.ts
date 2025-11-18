import { z } from 'zod';

/**
 * Input validation schemas using Zod
 */

export const generateReportSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const issueDetectorSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const supportReplySchema = z.object({
  subject: z.string().min(1).max(500, 'Subject too long'),
  body: z.string().min(1).max(10000, 'Body too long'),
  history: z.string().max(50000, 'History too long').optional().default(''),
  clientConfig: z.record(z.unknown()).optional().default({}),
});

export const salesOutreachSchema = z.object({
  lead: z.object({
    company: z.string().min(1).max(200).optional(),
    contact: z.string().min(1).max(200).optional(),
    email: z.string().email().optional(),
    industry: z.string().max(100).optional(),
  }),
  template: z.string().min(1).max(100),
});

/**
 * Sanitizes user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates environment variables are properly configured
 */
export function validateEnvironment() {
  const required = [
    'OPENAI_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about optional but recommended variables
  const optional = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingOptional = optional.filter(key => !process.env[key]);

  if (missingOptional.length > 0) {
    console.warn(`[WARNING] Missing optional environment variables (app will run in demo mode): ${missingOptional.join(', ')}`);
  }
}
