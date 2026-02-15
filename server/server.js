import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import lessonsRoutes from './routes/lessons.js';
import progressRoutes from './routes/progress.js';
import aiRoutes from './routes/ai.js';
import translateRoutes from './routes/translate.js';
import leaderboardRoutes from './routes/leaderboard.js';
import gamesRoutes from './routes/games.js';
import socialRoutes from './routes/social.js';
import subscriptionRoutes from './routes/subscription.js';
import missionsRoutes from './routes/missions.js';
import shopRoutes from './routes/shop.js';
import friendsRoutes from './routes/friends.js';

// Import services
import { initScheduler } from './services/scheduler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: true, // Allow any origin in development
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/friends', friendsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();

        // Initialize scheduler for automated tasks
        initScheduler();

        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════╗
║   🚀 English Learning Platform API Server     ║
║   Environment: ${process.env.NODE_ENV?.padEnd(33)}║
║   Port: ${PORT.toString().padEnd(39)}║
║   Status: Running ✅                           ║
╚════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

startServer();

export default app;
