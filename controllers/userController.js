const users = require('../data/users/users.json');
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../data/users/users.json');

const getUsers = (req, res) => {
	res.json({
		ok: true,
		users,
	});
};

const processEdit = (req, res) => {
	const user = users.find((item) => String(item.id) === req.params.id);
	const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
	const apellido = typeof req.body.apellido === 'string' ? req.body.apellido.trim() : '';
	const edad = Number(req.body.edad);

	if (!user) {
		return res.status(404).json({
			ok: false,
			message: 'Usuario no encontrado',
		});
	}

	if (!name || !apellido || !Number.isInteger(edad) || edad < 0) {
		return res.status(400).json({
			ok: false,
			message: 'El nombre, apellido y una edad válida son obligatorios',
		});
	}

	user.name = name;
	user.apellido = apellido;
	user.edad = edad;
	fs.writeFileSync(usersFile, `${JSON.stringify(users, null, 2)}\n`);

	return res.json({
		ok: true,
		message: 'Usuario actualizado correctamente',
		user,
	});
};

module.exports = {
	getUsers,
	processEdit,
};
