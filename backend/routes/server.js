const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const session    = require('express-session');
const passport   = require('passport');

const authRoutes   = require('./routes/auth');
const uploadRoutes = require('./routes/uploads');
const adminRoutes  = require('./routes/admin');
const courseRoutes = require('./routes/courses');

require('./config/passport');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'studyhub_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,      // set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth',    authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/courses', courseRoutes);

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
