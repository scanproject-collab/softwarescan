import express from 'express';
import authRoutes from './routes/authRoutes';
import operatorRoutes from './routes/operatorRoutes';
import adminRoutes from './routes/adminRoutes';
import managerRoutes from './routes/managerRoutes';
import institutionRoutes from './routes/institutionRoutes';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/auth', authRoutes);
app.use('/operator', operatorRoutes);
app.use('/admin', adminRoutes);
app.use('/manager', managerRoutes);
app.use('/institutions', institutionRoutes);

app.get('/', (_req, res) => {
  res.send('API is working!');
});

export default app;