const router = require('express').Router();
const modelesController = require('../controllers/modeles.controller');
const valider = require('../middlewares/valider.middleware');
const { create, update } = require('../validations/modeles.validation');

router.get('/',       modelesController.getAll);
router.get('/:id',    modelesController.getById);
router.post('/',      create, valider, modelesController.create);
router.put('/:id',    update, valider, modelesController.update);
router.delete('/:id', modelesController.delete);

module.exports = router;
