import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './database.js';
import helmet from 'helmet';
import rateLimiter from 'express-rate-limit';
import dotenv from 'dotenv';
import auth from './middleware/authentication.js';
import userRoute from './router/user.js';
import authRoute from './router/Auth.js';
import messageRoute from './router/message.js';
import path from 'path';

dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 8000;

/// Middleware
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

// Rate Limiting
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
//   })
// );

// Helmet Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        connectSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      },
    },
  })
);
 
// Serve Static Files
app.use(express.static(path.resolve('public')));

// Routes
app.get('/api/v1/message/:id', (req, res) => {
  res.sendFile(path.resolve('public/send-message.html'));
});
app.get('/api/v1/auth/register', (req, res) => {
  res.sendFile(path.resolve('public/register.html'));
});
app.get('/api/v1/auth/login', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', auth, userRoute);
app.use('/api/v1/message', messageRoute);

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Closing server...');
      await mongoose.disconnect();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();
