require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const WebSocket = require('ws');
const uniqueValidator = require('mongoose-unique-validator');

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

// Firebase Admin Initialization
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

// MongoDB Connection
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

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

connectWithRetry();

// Database Models
const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true, trim: true, minlength: 3 },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date, default: () => Date.now() + 86400000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TaskSchema.plugin(uniqueValidator);
TaskSchema.index({ userId: 1, completed: 1 });
TaskSchema.index({ dueDate: 1 });
const Task = mongoose.model('Task', TaskSchema);

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  duration: { 
    type: Number, 
    required: true,
    min: [300, 'Minimum session duration is 5 minutes'],
    max: [14400, 'Maximum session duration is 4 hours']
  },
  startTime: { type: Date, required: true },
  endTime: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startTime;
      },
      message: 'End time must be after start time'
    }
  }
});
const FocusSession = mongoose.model('FocusSession', SessionSchema);

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Bearer token missing' });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

// Broadcast function for WebSocket
const broadcastUpdate = () => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'DATA_UPDATE' }));
    }
  });
};

// API Routes
const router = express.Router();

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
    const tasks = await Task.find({ userId: req.user.uid });
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
      ...req.body
    });
    
    await task.save();
    broadcastUpdate();
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      req.body,
      { new: true, runValidators: true }
    ).lean();
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Broadcast update to all WebSocket clients
    broadcastUpdate();
    res.json(task);
    
  } catch (error) {
    console.error('Task update error:', error);
    res.status(400).json({ 
      error: error.message,
      validationErrors: error.errors 
    });
  }
});

router.delete('/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    broadcastUpdate();
    res.sendStatus(204);
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Session Endpoints
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const { action, duration, timestamp } = req.body;
    const now = new Date();
    let session;

    switch (action) {
      case 'start':
        session = new FocusSession({
          userId: req.user.uid,
          duration,
          startTime: now,
          endTime: new Date(now.getTime() + duration * 1000)
        });
        break;

      case 'stop':
        session = await FocusSession.findOneAndUpdate(
          { userId: req.user.uid, endTime: { $gt: now } },
          { endTime: now },
          { new: true }
        );
        break;

      default:
        return res.status(400).json({ error: 'Invalid session action' });
    }

    if (!session) return res.status(404).json({ error: 'Session not found' });
    await session.save();
    broadcastUpdate();
    res.status(201).json(session);
  } catch (error) {
    console.error('Session error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Stats Endpoint
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

app.use('/api/v1', router);

// Error Handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// WebSocket Server Setup
const server = app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running in ${isProduction ? 'production' : 'development'} mode on port ${process.env.PORT || 5001}`);
  console.log(`Database: ${process.env.MONGODB_URI.split('@')[1].split('/')[0]}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Streak Calculation
function calculateStreak(sessions) {
  if (!sessions.length) return 0;
  
  const sortedDates = [...new Set(sessions
    .map(s => s.endTime.toISOString().split('T')[0])
  )].sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let currentDate = new Date();
  
  while (sortedDates.includes(currentDate.toISOString().split('T')[0])) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

// Process Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});