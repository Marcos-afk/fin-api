import { customers } from '../database';

export const isExistAccountByCpf = (req, res, next) => {
  const { cpf } = req.headers;
  const customer = customers.find(c => c.cpf === cpf);
  if (!customer) {
    return res.status(400).json({ message: 'Cliente não encontrado' });
  }

  req.customer = customer;

  return next();
};
