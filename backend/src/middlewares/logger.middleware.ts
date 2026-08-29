import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    const resetColor = '\x1b[0m';

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${statusColor}${statusCode}${resetColor} - ${duration}ms | IP: ${clientIp} | Agent: ${userAgent.slice(0, 45)}`
    );
  });

  next();
}