import { Router } from 'express';
import transactionsRouter from './transactions.routes';
import categoriesRouter from './categories.routes';

const appRouter = Router();
appRouter.use('/transactions', transactionsRouter);
appRouter.use('/categories', categoriesRouter);

export default appRouter;
