import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import resumeRoutes from './routes/resumeRoutes';
import scheduleRoutes from './routes/scheduleRoutes';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resume', resumeRoutes);

app.use('/api/schedules', scheduleRoutes);

app.get('/', (req, res) => {
  res.send('Express + TypeScript + Supabase Backend');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;