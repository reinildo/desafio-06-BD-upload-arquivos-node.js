import { Request, Response, Router } from 'express';
import CreateCategoryService from '../services/CreateCategoryService';

const categoryRouter = Router();

categoryRouter.post('/', async (request: Request, response: Response) => {
  try {
    const { title } = request.body;
    const createCategory = new CreateCategoryService();
    const category = await createCategory.execute(title);
    return response.json(category);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

export default categoryRouter;
