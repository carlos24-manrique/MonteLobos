import { Router } from 'express';
import { createReservation } from '../controllers/reservationController.js';
import { reservationRules } from '../lib/validators.js';

const reservationRoutes = Router();
reservationRoutes.post('/', reservationRules, createReservation);
export default reservationRoutes;
