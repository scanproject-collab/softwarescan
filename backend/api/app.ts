import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import operatorRoutes from '../src/routes/operatorRoutes';
import adminRoutes from '../src/routes/adminRoutes';
import managerRoutes from '../src/routes/managerRoutes';
import institutionRoutes from '../src/routes/institutionRoutes';
import postRoutes from '../src/routes/postRoutes';
import { deleteExpiredOperators } from '../src/controllers/adminController';
import chalk from 'chalk';
import cron from 'node-cron';
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/auth', authRoutes);
app.use('/operator', operatorRoutes);
app.use('/admin', adminRoutes);
app.use('/manager', managerRoutes);
app.use('/institutions', institutionRoutes);
app.use('/posts', postRoutes);

app.get('/', (_req, res) => {
  res.send('API is working!');
});

cron.schedule('0 0 * * *', () => {
  console.log('Running daily cleanup of expired operators...');
  deleteExpiredOperators();
});

app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).send('Internal Server Error');
});




export default app;