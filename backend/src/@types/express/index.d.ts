// src/@types/express/index.d.ts
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user_id?: string;  // Note o underscore
      organizationId?: string;
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}