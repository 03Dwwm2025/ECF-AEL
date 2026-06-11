const { body } = require('express-validator');

exports.create = [
  body('nom').notEmpty().withMessage('Nom requis'),
  body('prenom').notEmpty().withMessage('Prénom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('mdp').isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum'),
  body('dateNaissance').isDate().withMessage('Date de naissance invalide'),
  body('dateEmbauche').isDate().withMessage("Date d'embauche invalide"),
  body('activite').optional().isBoolean().withMessage('activite doit être un booléen')
];

exports.update = [
  body('nom').optional().notEmpty().withMessage('Nom invalide'),
  body('prenom').optional().notEmpty().withMessage('Prénom invalide'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('dateNaissance').optional().isDate().withMessage('Date de naissance invalide'),
  body('dateEmbauche').optional().isDate().withMessage("Date d'embauche invalide"),
  body('activite').optional().isBoolean().withMessage('activite doit être un booléen')
];
