import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { customers } from './database';
import { v4 } from 'uuid';
import { isExistAccountByCpf } from './middlewares/isExistAccountByCpf';
import { getBalance } from './utils/getBalance';
config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/account', isExistAccountByCpf, (req, res) => {
  const { customer } = req;
  return res.status(200).json({ customer });
});

app.get('/account/balance', isExistAccountByCpf, (req, res) => {
  const { customer } = req;

  const balance = getBalance(customer.statement);
  return res.status(200).json({ balance });
});

app.get('/statement', isExistAccountByCpf, (req, res) => {
  const { customer } = req;
  return res.status(200).json({ statement: customer.statement });
});

app.get('/statement/date', isExistAccountByCpf, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + ' 00:00');
  const statements = customer.statement.filter(s => s.createdAt.toDateString() === new Date(dateFormat).toDateString());
  return res.status(200).json({ statements });
});

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

app.post('/deposit', isExistAccountByCpf, (req, res) => {
  const { customer } = req;
  const { description, amount } = req.body;

  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: 'credit',
  };

  customer.statement.push(statementOperation);
  return res.status(200).json({ message: 'Deposito realizado com sucesso!', statementOperation });
});

app.post('/withdraw', isExistAccountByCpf, (req, res) => {
  const { customer } = req;
  const { amount } = req.body;

  const balance = getBalance(customer.statement);
  if (balance < amount) {
    return res.status(400).json({ message: 'Não é possível fazer essa operação, saldo insuficiente' });
  }

  const statementOperation = {
    amount,
    createdAt: new Date(),
    type: 'debit',
  };
  customer.statement.push(statementOperation);
  return res.status(200).json({ message: 'Saque realizado com sucesso!', statementOperation });
});

app.put('/account', isExistAccountByCpf, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).json({ message: 'Dados do cliente atualizados com sucesso!', customer });
});

app.delete('/account', isExistAccountByCpf, (req, res) => {
  const { customer } = req;

  const customerIndex = customers.findIndex(c => c.id === customer.id);
  if (customerIndex === -1) {
    return res.status(400).json({ message: 'Índice não encontrado' });
  }

  customers.splice(customerIndex, 1);
  return res.status(201).json({ message: 'Dados do cliente apagados com sucesso!', customers });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na url/porta: ${PORT}`);
});
