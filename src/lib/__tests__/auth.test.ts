import { hashPassword, verifyPassword } from '../auth';

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', async () => {
      const password = '';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should reject empty password against valid hash', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);
      
      expect(isValid).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('testpassword123!', hash);
      
      expect(isValid).toBe(false);
    });
  });
});
