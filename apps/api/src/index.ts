import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes, { permissionsRouter } from './routes/role.routes';
import statsRoutes from './routes/stats.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/permissions', permissionsRouter);
app.use('/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   POST   /auth/login       - Login`);
  console.log(`   POST   /auth/refresh      - Refresh token`);
  console.log(`   GET    /auth/me          - Get current user`);
  console.log(`   POST   /auth/logout      - Logout`);
  console.log(`   GET    /users            - List users`);
  console.log(`   POST   /users            - Create user`);
  console.log(`   GET    /roles            - List roles`);
  console.log(`   POST   /roles            - Create role`);
  console.log(`   GET    /permissions      - List permissions`);
  console.log(`   GET    /stats            - Get dashboard stats`);
});
