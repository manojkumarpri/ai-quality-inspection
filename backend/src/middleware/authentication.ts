import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const userIdHeader = req.headers['x-user-id'] as string;

  if (!userIdHeader) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing x-user-id header.' } });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userIdHeader },
    });

    if (!user) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'User not found.' } });
    }

    req.user = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    next();
  } catch {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Authentication failed.' } });
  }
}