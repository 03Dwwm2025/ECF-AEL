const router = require('express').Router();
const calendrierController = require('../controllers/calendrier.controller');

router.get('/',            calendrierController.getAll);
router.get('/disponible',  calendrierController.getAvailable);

module.exports = router;
