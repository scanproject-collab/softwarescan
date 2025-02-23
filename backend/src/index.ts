import express from 'express';
import firebaseConfig from './service/firebaseConfig';

const app = express();
const port = 3000;

// Middleware para testar se a conexão está funcionando
app.get('/', (req, res) => {
  res.send('API está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
