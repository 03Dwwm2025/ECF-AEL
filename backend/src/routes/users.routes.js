const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const valider = require('../middlewares/valider.middleware');
const { update, updatePassword } = require('../validations/users.validation');

router.get('/',                 usersController.getAll);
router.get('/:id',              usersController.getById);
router.put('/:id',              update, valider, usersController.update);
router.put('/:id/password',     updatePassword, valider, usersController.updatePassword);
router.delete('/:id',           usersController.delete);

module.exports = router;
