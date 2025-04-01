require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Enhanced Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://time-management-app-theta.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(compression());

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.removeHeader('X-Powered-By');
  next();
});

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 200 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Firebase Admin Initialization with enhanced error handling
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
  process.exit(1);
}

// MongoDB Connection with modern settings
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    setTimeout(connectWithRetry, 5000);
  });
};

mongoose.connection.on('connected', () => {
  console.log('MongoDB connection active');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

connectWithRetry();

// Database Models
const Task = mongoose.model('Task', new mongoose.Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}));

const FocusSession = mongoose.model('FocusSession', new mongoose.Schema({
  userId: { type: String, required: true },
  duration: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
}));

// Enhanced Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Bearer token missing' });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// API Routes
const router = express.Router();

// Enhanced Health Check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Task Endpoints
router.get('/tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.uid }).lean();
    res.json(tasks);
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', authenticate, async (req, res) => {
  try {
    const task = new Task({
      userId: req.user.uid,
      ...req.body,
      dueDate: req.body.dueDate || new Date()
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(400).json({ error: 'Invalid task data' });
  }
});

// Focus Session Endpoints
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const session = new FocusSession({
      userId: req.user.uid,
      ...req.body,
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime)
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(400).json({ error: 'Invalid session data' });
  }
});

// Enhanced Stats Endpoint
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [tasksCompleted, focusSessions] = await Promise.all([
      Task.countDocuments({ userId: req.user.uid, completed: true }),
      FocusSession.find({ userId: req.user.uid })
    ]);

    const totalFocus = focusSessions.reduce((acc, session) => acc + session.duration, 0);
    const currentStreak = calculateStreak(focusSessions);

    res.json({
      tasksCompleted: tasksCompleted || 0,
      totalFocus: totalFocus || 0,
      currentStreak: currentStreak || 0
    });
  } catch (error) {
    console.error('Stats calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Apply routes
app.use('/api/v1', router);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Production Configuration
if (isProduction) {
  app.set('trust proxy', 1);
}

// Process Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Streak Calculation Helper
function calculateStreak(sessions) {
  if (!sessions.length) return 0;
  
  const sortedDates = sessions
    .map(s => s.endTime)
    .sort((a, b) => b - a)
    .map(d => d.toISOString().split('T')[0]);

  let streak = 0;
  let currentDate = new Date();
  
  while (true) {
    const dateString = currentDate.toISOString().split('T')[0];
    if (sortedDates.includes(dateString)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
  console.log(`Database: ${process.env.MONGODB_URI.split('@')[1].split('/')[0]}`);
});