import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { customers } from './database';
import { v4 } from 'uuid';
config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/account', (req, res) => {
  const { name, cpf } = req.body;

  const isExistingCpf = customers.some(c => c.cpf === cpf);
  if (isExistingCpf) {
    return res.status(400).json({ message: 'cpf inválido' });
  }

  const customer = {
    id: v4(),
    name,
    cpf,
    statement: [],
  };

  customers.push(customer);
  return res.status(201).json({ message: 'Cliente cadastrado com sucesso!', customer });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na url/porta: ${PORT}`);
});
