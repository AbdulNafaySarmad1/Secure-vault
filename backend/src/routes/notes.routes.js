const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validators = require('../middleware/validation.middleware');

router.use(authenticate);

router.post('/', validators.note, notesController.create);
router.get('/', validators.pagination, notesController.list);
router.get('/:id', notesController.getById);
router.put('/:id', validators.note, notesController.update);
router.delete('/:id', notesController.delete);

module.exports = router;
