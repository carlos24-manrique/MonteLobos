import express from 'express';
import session from 'express-session';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import mainRoutes from './routes/mainRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.json({ limit: '10kb' }));
app.use(session({
    name: 'montelobos.sid',
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use(mainRoutes);
app.use(express.static(join(__dirname, 'public')));

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (req.path.startsWith('/api/')) {
        return res.status(error.status || 500).json({
            message: error.status ? error.message : 'Ocurrió un error interno.'
        });
    }
    return res.status(error.status || 500).send(error.status ? error.message : 'Ocurrió un error interno.');
});

app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

export default app;
