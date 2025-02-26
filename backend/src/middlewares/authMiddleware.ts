import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

interface CustomRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Authentication token missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token as string);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
