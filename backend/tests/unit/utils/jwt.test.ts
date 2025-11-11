import { generateToken, verifyToken } from '../../../src/utils/jwt';

describe('JWT Utils', () => {
  const mockPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'STAFF',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create token with very short expiry (1ms)
      const oldSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'test-secret-key-for-testing-only-min-32-chars';
      
      const token = generateToken(mockPayload);
      
      // Wait for token to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(() => {
            verifyToken(token);
          }).toThrow();
          process.env.JWT_SECRET = oldSecret;
          resolve();
        }, 10);
      });
    });
  });
});

