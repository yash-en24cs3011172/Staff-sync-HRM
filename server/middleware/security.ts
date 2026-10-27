import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { UserRole } from '../../src/types/hrm.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-hrm-system-jwt-secret-2026';

export interface JwtPayloadData {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadData;
}

interface EndpointMetric {
  route: string;
  count: number;
  totalMs: number;
  maxMs: number;
}

const endpointMetrics = new Map<string, EndpointMetric>();
let totalRequestsCount = 0;

export function getApiPerformanceSnapshot() {
  const routes = Array.from(endpointMetrics.values())
    .map((m) => ({
      route: m.route,
      requests: m.count,
      avgLatencyMs: Number((m.totalMs / Math.max(1, m.count)).toFixed(2)),
      maxLatencyMs: Number(m.maxMs.toFixed(2)),
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);

  const overallAvg =
    routes.length > 0
      ? Number(
          (
            routes.reduce((sum, r) => sum + r.avgLatencyMs * r.requests, 0) /
            Math.max(1, routes.reduce((sum, r) => sum + r.requests, 0))
          ).toFixed(2)
        )
      : 0;

  return {
    totalApiRequests: totalRequestsCount,
    overallAvgLatencyMs: overallAvg,
    memoryRssMb: Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1)),
    uptimeSeconds: Math.round(process.uptime()),
    routes,
  };
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

export function signToken(payload: JwtPayloadData): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayloadData {
  return jwt.verify(token, JWT_SECRET) as JwtPayloadData;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      });
      return;
    }
    next();
  };
}

export function sanitizeString(val: unknown, maxLength = 500): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

export function isValidDateStr(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !Number.isNaN(Date.parse(dateStr));
}

export function responseTimerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${elapsedMs.toFixed(2)}ms`);
    }
    if (req.originalUrl.startsWith('/api/')) {
      totalRequestsCount += 1;
      const cleanPath = req.originalUrl.split('?')[0];
      const key = `${req.method} ${cleanPath}`;
      const existing = endpointMetrics.get(key) || {
        route: key,
        count: 0,
        totalMs: 0,
        maxMs: 0,
      };
      existing.count += 1;
      existing.totalMs += elapsedMs;
      existing.maxMs = Math.max(existing.maxMs, elapsedMs);
      endpointMetrics.set(key, existing);
    }
    return originalJson(body);
  };
  next();
}
