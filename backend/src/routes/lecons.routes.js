const router = require('express').Router();
const leconsController = require('../controllers/lecons.controller');
const valider = require('../middlewares/valider.middleware');
const { create, update, delete: deleteRules, valider: validerRules } = require('../validations/lecons.validation');

router.get('/',                     leconsController.getAll);
router.get('/eleve/:idEleve',       leconsController.getByEleve);
router.get('/moniteur/:idMoniteur', leconsController.getByMoniteur);
router.post('/',                    create, valider, leconsController.create);
router.put('/valider',              validerRules, valider, leconsController.valider);
router.put('/',                     update, valider, leconsController.update);
router.delete('/',                  deleteRules, valider, leconsController.delete);

module.exports = router;
