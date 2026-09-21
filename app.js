import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mainRoutes from './routes/mainRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(mainRoutes);
app.use(express.static(join(__dirname, 'public')));

app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

export default app;
