const express = require('express');
const mainRouter = require('./routes/main');
const userRouter = require('./routes/user');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/ejs`);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', mainRouter);
app.use('/users', userRouter);

app.listen(port, () => {
	console.log(`Servidor iniciado en http://localhost:${port}`);
});
