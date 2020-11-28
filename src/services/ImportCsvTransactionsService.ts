import csvParser from 'csv-parse';
import fs from 'fs';
import { In, getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';
import Category from '../models/Category';

interface CSVData {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: any;
}

class ImportCsvTransactionsService {
  public async execute(fpath: string): Promise<Transaction[]> {
    const data = await this.loadCSV(fpath);

    const allCategories: string[] = [];
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const transactions: CSVData[] = data.map(item => {
      allCategories.push(item[3]);
      return {
        title: item[0],
        type: item[1] === 'income' ? 'income' : 'outcome',
        value: Number(item[2]),
        category: item[3],
      };
    });

    const filteredCategories = [...new Set(allCategories)];

    const categoriesRepository = getRepository(Category);
    const existentCategories = await categoriesRepository.find({
      where: { title: In(filteredCategories) },
    });

    console.log('filteredCategories: ', filteredCategories);
    console.log('existentCategories: ', existentCategories);

    const existentCategoriesTitles = existentCategories.map(cat => cat.title);

    const addCategories = filteredCategories.filter(
      cat => !existentCategoriesTitles.includes(cat),
    );

    const newCategories = await categoriesRepository.save(
      addCategories.map(title => ({
        title,
      })),
    );

    const finalCategories = [...existentCategories, ...newCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          cat => cat.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(fpath);

    return createdTransactions;
  }

  private async loadCSV(filepath: string) {
    // const csvFilePath = path.resolve(uploadConfig.directory, file);
    const readCSVStream = fs.createReadStream(filepath);

    const parseStream = csvParser({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    const lines: string[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportCsvTransactionsService;
