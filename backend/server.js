require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Enhanced Security Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Firebase Admin Initialization
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

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

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authorization required' });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
const router = express.Router();

// Task Endpoints
router.get('/tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.uid });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', authenticate, async (req, res) => {
  try {
    const task = new Task({
      userId: req.user.uid,
      text: req.body.text,
      dueDate: req.body.dueDate || new Date()
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Invalid task data' });
  }
});

router.put('/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      { completed: req.body.completed },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Focus Session Endpoints
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const session = new FocusSession({
      userId: req.user.uid,
      duration: req.body.duration,
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime)
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: 'Invalid session data' });
  }
});

// Statistics Endpoint
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [tasksCompleted, focusSessions] = await Promise.all([
      Task.countDocuments({ userId: req.user.uid, completed: true }),
      FocusSession.find({ userId: req.user.uid })
    ]);

    const totalFocus = focusSessions.reduce((acc, session) => acc + session.duration, 0);
    
    res.json({
      tasksCompleted,
      totalFocus,
      currentStreak: calculateStreak(focusSessions)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load statistics' });
  }
});

// Apply routes
app.use('/api/v1', router);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => 
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
);

// Helper function for streak calculation
function calculateStreak(sessions) {
  // Implement your streak logic here
  return 3; // Temporary placeholder
}