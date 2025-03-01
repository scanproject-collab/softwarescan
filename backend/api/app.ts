import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import operatorRoutes from '../src/routes/operatorRoutes';
import adminRoutes from '../src/routes/adminRoutes';
import managerRoutes from '../src/routes/managerRoutes';
import institutionRoutes from '../src/routes/institutionRoutes';
import chalk from 'chalk';

const app = express();

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

app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).send('Internal Server Error');
});


export default app;