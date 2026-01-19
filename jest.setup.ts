import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock next-auth to avoid ESM issues
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));
