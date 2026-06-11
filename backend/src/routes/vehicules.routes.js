const router = require('express').Router();
const vehiculesController = require('../controllers/vehicules.controller');
const valider = require('../middlewares/valider.middleware');
const { create, update } = require('../validations/vehicules.validation');

router.get('/',               vehiculesController.getAll);
router.get('/:numImmat',      vehiculesController.getById);
router.post('/',              create, valider, vehiculesController.create);
router.put('/:numImmat',      update, valider, vehiculesController.update);
router.delete('/:numImmat',   vehiculesController.delete);

module.exports = router;
