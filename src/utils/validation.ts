export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(payload: unknown): ValidationResult {
  if (typeof payload !== 'object' || payload === null) {
    return { valid: false, errors: ['Request body must be a JSON object.'] };
  }

  const { customerName, email } = payload as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof customerName !== 'string' || customerName.trim().length === 0) {
    errors.push('customerName is required and must be a non-empty string.');
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('email is required and must be a valid email address.');
  }

  return { valid: errors.length === 0, errors };
}