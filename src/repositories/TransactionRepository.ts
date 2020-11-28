import { EntityRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
export default class TransactionRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const { income, outcome }: Balance = transactions.reduce(
      (acc, curr) => {
        acc.income =
          curr.type === 'income'
            ? (acc.income += Number(curr.value))
            : acc.income;
        acc.outcome =
          curr.type === 'outcome'
            ? (acc.outcome += Number(curr.value))
            : acc.outcome;
        return acc;
      },
      { income: 0, outcome: 0, total: 0 },
    );
    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}
