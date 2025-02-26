import express from 'express';
import authRoutes from './routes/authRoutes';

export const app = express();
app.use(express.json()); 

app.use('/auth', authRoutes); 

app.get('/', (req, res) => {
  res.send('API está funcionando!');
});

export default app;
