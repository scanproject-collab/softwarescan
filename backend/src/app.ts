import express from 'express';

export const app = express();

app.get('/', (req, res) => {
  res.send('API está funcionando!'); 
});


export default app;