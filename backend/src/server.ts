import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import projectRoutes from './routes/projectRoutes';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for hackathon local environments
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'ContextOS API',
    version: '1.0.0',
    demoMode: process.env.DEMO_MODE === 'true',
    liveAI: !!(process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);

// Production Static Serving (Single-container / unified cloud deployment)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 ContextOS Platform Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🛡️ Demo Mode: ${process.env.DEMO_MODE === 'true' ? 'Active' : 'Disabled'}`);
    console.log(`⚡ Database: SQLite (Prisma)`);
    console.log(`📦 Serving Static Frontend: ${fs.existsSync(frontendDistPath) ? 'Yes' : 'No'}`);
    console.log(`=========================================`);
  });
}

export default app;
