const router = require('express').Router();
const elevesController = require('../controllers/eleves.controller');
const valider = require('../middlewares/valider.middleware');
const { create, update } = require('../validations/eleves.validation');

router.get('/',       elevesController.getAll);
router.get('/:id',    elevesController.getById);
router.post('/',      create, valider, elevesController.create);
router.put('/:id',    update, valider, elevesController.update);
router.delete('/:id', elevesController.delete);

module.exports = router;
