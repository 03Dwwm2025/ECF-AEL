const { body } = require('express-validator');

exports.update = [
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('nom').optional().notEmpty().withMessage('Nom invalide'),
  body('prenom').optional().notEmpty().withMessage('Prénom invalide'),
  body('dateNaissance').optional().isDate().withMessage('Date de naissance invalide')
];

exports.updatePassword = [
  body('ancienMdp').notEmpty().withMessage('Ancien mot de passe requis'),
  body('nouveauMdp').isLength({ min: 6 }).withMessage('Nouveau mot de passe : 6 caractères minimum')
];
