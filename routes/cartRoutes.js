import { Router } from 'express';
import { getCart, updateCart } from '../controllers/cartController.js';

const cartRoutes = Router();
cartRoutes.get('/', getCart);
cartRoutes.put('/', updateCart);

export default cartRoutes;
