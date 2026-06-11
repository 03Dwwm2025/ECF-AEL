const router = require('express').Router();
const moniteursController = require('../controllers/moniteurs.controller');
const valider = require('../middlewares/valider.middleware');
const { create, update } = require('../validations/moniteurs.validation');

router.get('/',       moniteursController.getAll);
router.get('/:id',    moniteursController.getById);
router.post('/',      create, valider, moniteursController.create);
router.put('/:id',    update, valider, moniteursController.update);
router.delete('/:id', moniteursController.delete);

module.exports = router;
