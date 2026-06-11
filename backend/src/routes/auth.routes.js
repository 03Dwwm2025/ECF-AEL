const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const valider = require('../middlewares/valider.middleware');
const { login } = require('../validations/auth.validation');

router.post('/login', login, valider, authController.login);

module.exports = router;
