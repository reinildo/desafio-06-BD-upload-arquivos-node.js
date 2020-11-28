import { Router, Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import TransactionRepository from '../repositories/TransactionRepository';
import ImportCsvTransactionsService from '../services/ImportCsvTransactionsService';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer({ storage: uploadConfig.storage });

transactionsRouter.get('/', async (request: Request, response: Response) => {
  const transactionRepository = getCustomRepository(TransactionRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request: Request, response: Response) => {
    const { path } = request.file;

    const importCSV = new ImportCsvTransactionsService();

    const transactions = await importCSV.execute(path);

    return response.send(transactions);
  },
);

transactionsRouter.post('/', async (request: Request, response: Response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const deleteTransaction = new DeleteTransactionService();
    await deleteTransaction.execute(id);

    return response.status(204).send();
  },
);

export default transactionsRouter;
