// Vercel serverless function entry point
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
const distPath = path.join(__dirname, '..', 'dist', 'public');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Fall through to index.html for SPA routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If build directory doesn't exist, return error
  app.get('*', (_req, res) => {
    res.status(500).json({ 
      error: 'Build directory not found. Please run `npm run build` first.' 
    });
  });
}

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error('Internal Server Error:', err);
  return res.status(status).json({ message });
});

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Convert Vercel request/response to Express format
  return new Promise<void>((resolve) => {
    const expressReq = req as any;
    const expressRes = res as any;
    
    app(expressReq, expressRes, () => {
      if (!expressRes.headersSent) {
        resolve();
      } else {
        resolve();
      }
    });
  });
}
