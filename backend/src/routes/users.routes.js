const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validators = require('../middleware/validation.middleware');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', usersController.list);
router.put('/:id', validators.userUpdate, usersController.update);

module.exports = router;
