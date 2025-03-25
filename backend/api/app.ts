import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { authRoutes, operatorRoutes, postRoutes, tagRoutes, managerRoutes, institutionRoutes, adminRoutes, polygnosRoutes } from "../src/routes/index";
import dotenv from "dotenv";
import cors from "cors";
import { setIo } from '../src/service/socket';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

setIo(io);

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
app.use('/polygons', polygnosRoutes);

io.on('connection', (socket) => {
  console.log('Cliente conectado ao WebSocket');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.get('/', (_req: any, res: { send: (arg0: string) => void; }) => {
  res.send('API is working!');
});

app.get('/google-maps-api-url', (_req: Request, res: Response) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyCfLlShC9EMKLBOlmjCJcxivCeUrvfUinE";
  if (!apiKey) {
    return res.status(500).json({ message: 'Google Maps API key not configured' });
  }
  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
  res.json({ url });
});

app.use((_req: Request, res: Response) => {
  res.status(404).send('Not found');
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error occurred:', err);
  res.status(500).send('Internal Server Error');
});


export default app;
