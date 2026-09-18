import { UserRole } from '../database/models/index.js';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: number; role: UserRole };
    }
  }
}

export {};
