import { Router } from 'express';
import { renderHome } from '../controllers/mainController.js';

const mainRouter = Router();

mainRouter.get('/', renderHome);
mainRouter.get('/index.html', renderHome);

export default mainRouter;
