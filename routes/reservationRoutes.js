import { Router } from 'express';
import { createReservation } from '../controllers/reservationController.js';

const reservationRoutes = Router();
reservationRoutes.post('/', createReservation);
export default reservationRoutes;
