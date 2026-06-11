const { body } = require('express-validator');

exports.create = [
  body('numImmat').notEmpty().isLength({ max: 9 }).withMessage('Numéro d\'immatriculation requis (9 caractères max)'),
  body('idModele').isInt({ gt: 0 }).withMessage('idModele invalide'),
  body('annee').isInt({ min: 1900, max: 2100 }).withMessage('Année invalide'),
  body('dateAchat').isDate().withMessage("Date d'achat invalide"),
  body('etat').optional().isBoolean().withMessage('etat doit être un booléen')
];

exports.update = [
  body('idModele').optional().isInt({ gt: 0 }).withMessage('idModele invalide'),
  body('annee').optional().isInt({ min: 1900, max: 2100 }).withMessage('Année invalide'),
  body('dateAchat').optional().isDate().withMessage("Date d'achat invalide"),
  body('etat').optional().isBoolean().withMessage('etat doit être un booléen')
];
