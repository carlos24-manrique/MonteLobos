const express = require('express');
const userController = require('../controllers/userController');
const mainController = require('../controllers/mainController');

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/register', mainController.registerView);
router.get('/edit/:id', mainController.editView);
router.get('/detail/:id', mainController.detail);
router.get('/delete/:id', mainController.deleteUser);
router.post('/register', mainController.register);
router.post('/edit/:id', userController.processEdit);
router.delete('/:id', mainController.deleteUser);
router.put('/:id', userController.processEdit);
router.patch('/:id', userController.processEdit);
router.get('/:id', mainController.detail);

module.exports = router;
