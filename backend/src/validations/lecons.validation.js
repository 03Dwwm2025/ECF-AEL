const { body } = require('express-validator');

exports.create = [
  body('idEleve').isInt({ gt: 0 }).withMessage('idEleve invalide'),
  body('idMoniteur').isInt({ gt: 0 }).withMessage('idMoniteur invalide'),
  body('idModele').isInt({ gt: 0 }).withMessage('idModele invalide'),
  body('dateHeure').isISO8601().withMessage('dateHeure invalide (format ISO 8601 attendu)'),
  body('duree').isInt({ gt: 0 }).withMessage('duree doit être un entier positif')
];

exports.update = [
  body('pk').exists().withMessage('pk requis'),
  body('pk.idModele').isInt({ gt: 0 }).withMessage('pk.idModele invalide'),
  body('pk.dateHeure').isISO8601().withMessage('pk.dateHeure invalide'),
  body('pk.idEleve').isInt({ gt: 0 }).withMessage('pk.idEleve invalide'),
  body('pk.idMoniteur').isInt({ gt: 0 }).withMessage('pk.idMoniteur invalide'),
  body('data.duree').isInt({ gt: 0 }).withMessage('data.duree doit être un entier positif')
];

exports.delete = [
  body('idModele').isInt({ gt: 0 }).withMessage('idModele invalide'),
  body('dateHeure').isISO8601().withMessage('dateHeure invalide'),
  body('idEleve').isInt({ gt: 0 }).withMessage('idEleve invalide'),
  body('idMoniteur').isInt({ gt: 0 }).withMessage('idMoniteur invalide')
];

exports.valider = [
  body('idModele').isInt({ gt: 0 }).withMessage('idModele invalide'),
  body('dateHeure').isISO8601().withMessage('dateHeure invalide'),
  body('idEleve').isInt({ gt: 0 }).withMessage('idEleve invalide'),
  body('idMoniteur').isInt({ gt: 0 }).withMessage('idMoniteur invalide')
];
