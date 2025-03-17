import express, { Request, Response, NextFunction } from 'express';

import authRoutes from '../src/routes/authRoutes';
import operatorRoutes from '../src/routes/operatorRoutes';
import adminRoutes from '../src/routes/adminRoutes';
import managerRoutes from '../src/routes/managerRoutes';
import institutionRoutes from '../src/routes/institutionRoutes';
import postRoutes from '../src/routes/postRoutes';
import tagRoutes from '../src/routes/tagRoutes';

import chalk from 'chalk';

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
app.use('/tags', tagRoutes);

app.get('/', (_req, res) => {
  res.send('API is working!');
});

app.use((_req: Request, res: Response) => {
  res.status(404).send('Not found');
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error occurred:', err);
  res.status(500).send('Internal Server Error');
});


export default app;