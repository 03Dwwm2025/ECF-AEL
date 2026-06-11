const { body } = require('express-validator');

exports.login = [
  body('email').isEmail().withMessage('Email invalide'),
  body('mdp').notEmpty().withMessage('Mot de passe requis')
];
