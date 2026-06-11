const { body } = require('express-validator');

exports.create = [
  body('nomEleve').notEmpty().withMessage('Nom requis'),
  body('prenomEleve').notEmpty().withMessage('Prénom requis'),
  body('telephone').optional({ nullable: true }).isMobilePhone('fr-FR').withMessage('Téléphone invalide'),
  body('dateNaissance').isDate().withMessage('Date de naissance invalide'),
  body('dateInscription').isDate().withMessage("Date d'inscription invalide"),
  body('code').optional().isBoolean().withMessage('code doit être un booléen'),
  body('conduite').optional().isBoolean().withMessage('conduite doit être un booléen')
];

exports.update = [
  body('nomEleve').optional().notEmpty().withMessage('Nom invalide'),
  body('prenomEleve').optional().notEmpty().withMessage('Prénom invalide'),
  body('telephone').optional({ nullable: true }).isMobilePhone('fr-FR').withMessage('Téléphone invalide'),
  body('dateNaissance').optional().isDate().withMessage('Date de naissance invalide'),
  body('dateInscription').optional().isDate().withMessage("Date d'inscription invalide"),
  body('code').optional().isBoolean().withMessage('code doit être un booléen'),
  body('conduite').optional().isBoolean().withMessage('conduite doit être un booléen')
];
