// @ts-ignore
import express, { Request, Response, NextFunction } from 'express';

import { authRoutes, operatorRoutes, postRoutes, tagRoutes, managerRoutes, institutionRoutes, adminRoutes } from "../src/routes/index"

// @ts-ignore
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

app.get('/', (_req: any, res: { send: (arg0: string) => void; }) => {
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