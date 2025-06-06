import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

import './config/passport';
import cors from 'cors';
import dotenv from 'dotenv';
    
dotenv.config();

const app = express();

// Middleware
// Enable CORS for all routes
app.use(cors({
    origin: process.env.FRONTEND_URL, // Allow requests from this origin
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(session({
    secret: process.env.SESSION_SECRET!, // Session secret must be provided in environment variables
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.json());

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET!, // Session secret must be provided in environment variables
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

export {sessionMiddleware};
export default app;