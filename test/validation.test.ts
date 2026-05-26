import { validateLead } from '../src/utils/validation';

describe('validateLead', () => {
  it('accepts a well-formed lead', () => {
    const result = validateLead({ customerName: 'John Doe', email: 'john@vw.com' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a missing customerName', () => {
    const result = validateLead({ email: 'john@vw.com' });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('customerName')]),
    );
  });

  it('rejects an invalid email', () => {
    const result = validateLead({ customerName: 'John Doe', email: 'not-an-email' });
    expect(result.valid).toBe(false);
  });

  it('rejects a non-object payload', () => {
    expect(validateLead('nope').valid).toBe(false);
    expect(validateLead(null).valid).toBe(false);
  });
});
