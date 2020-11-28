import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';

interface CreateTransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: CreateTransactionDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('Saldo insuficiente', 400);
      }
    }

    let new_category = null;

    if (category) {
      new_category = await categoryRepository.findOne({
        where: { title: category },
      });

      if (!new_category) {
        new_category = categoryRepository.create({ title: category });
        await categoryRepository.save(new_category);
      }
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: new_category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
