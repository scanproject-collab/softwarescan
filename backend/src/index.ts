import app from "./app";
import chalk from "chalk"; 

const port = 3000;

app.listen(port, () => {
  console.log(chalk.green(`Servidor rodando na porta ${port}`));  
});
