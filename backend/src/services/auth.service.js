const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

const authService = {

  async login(email, mdp) {
    const row = await userRepository.getByEmail(email);
    if (!row) {
      const err = new Error('Email ou mot de passe incorrect');
      err.status = 401;
      throw err;
    }

    const valid = await bcrypt.compare(mdp, row.mdp);
    if (!valid) {
      const err = new Error('Email ou mot de passe incorrect');
      err.status = 401;
      throw err;
    }

    const token = jwt.sign(
      { idUser: row.idUser, role: row.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return token;
  }

};

module.exports = authService;
