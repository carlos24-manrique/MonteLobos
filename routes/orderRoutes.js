import { Router } from 'express';
import { createOrder, listOrders } from '../controllers/orderController.js';

const orderRoutes = Router();
orderRoutes.get('/', listOrders);
orderRoutes.post('/', createOrder);
export default orderRoutes;
