import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CustomRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.SECRET_KEY_SESSION || 'your_jwt_secret_key';

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(403).json({ message: 'Authentication required: No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'You do not have permission to access this resource' });
      return;
    }
    next();
  };
};