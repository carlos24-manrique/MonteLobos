import { Router } from 'express';
import { getSession, login, logout, register } from '../controllers/authController.js';
import { uploadAvatar } from '../lib/upload.js';
import { loginRules, registerRules } from '../lib/validators.js';

const authRoutes = Router();

authRoutes.get('/session', getSession);
// Orden de middlewares: Multer (multipart + imagen) -> express-validator -> controlador.
authRoutes.post('/register', uploadAvatar, registerRules, register);
authRoutes.post('/login', loginRules, login);
authRoutes.post('/logout', logout);

export default authRoutes;
