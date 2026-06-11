const { body } = require('express-validator');

exports.create = [
  body('modeleVehicule').notEmpty().withMessage('Nom du modèle requis'),
  body('marque').notEmpty().withMessage('Marque requise')
];

exports.update = [
  body('modeleVehicule').optional().notEmpty().withMessage('Nom du modèle invalide'),
  body('marque').optional().notEmpty().withMessage('Marque invalide')
];
