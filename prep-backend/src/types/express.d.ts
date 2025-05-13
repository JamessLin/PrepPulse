// Add custom properties to Express Request
import express from 'express';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
      };
    }
  }
} 