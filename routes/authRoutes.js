import { Router } from 'express';
import { getSession, login, logout, register } from '../controllers/authController.js';

const authRoutes = Router();

authRoutes.get('/session', getSession);
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);

export default authRoutes;