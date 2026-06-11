const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');

const SALT_ROUNDS = 10;

function notFound() {
  const err = new Error('Utilisateur introuvable');
  err.status = 404;
  return err;
}

const usersService = {

  async getAll() {
    return userRepository.getAll();
  },

  async getById(id) {
    const user = await userRepository.getById(id);
    if (!user) throw notFound();
    return user;
  },

  async update(id, data) {
    const user = await userRepository.getById(id);
    if (!user) throw notFound();
    await userRepository.update(id, {
      email:         data.email         ?? user.email,
      nom:           data.nom           ?? user.nom,
      prenom:        data.prenom        ?? user.prenom,
      dateNaissance: data.dateNaissance ?? user.dateNaissance
    });
    return userRepository.getById(id);
  },

  async updatePassword(id, ancienMdp, nouveauMdp) {
    const row = await userRepository.getByEmail(
      (await userRepository.getById(id))?.email
    );
    if (!row) throw notFound();

    const valid = await bcrypt.compare(ancienMdp, row.mdp);
    if (!valid) {
      const err = new Error('Ancien mot de passe incorrect');
      err.status = 401;
      throw err;
    }

    const hash = await bcrypt.hash(nouveauMdp, SALT_ROUNDS);
    await userRepository.updatePassword(id, hash);
  },

  async delete(id) {
    const user = await userRepository.getById(id);
    if (!user) throw notFound();
    await userRepository.delete(id);
  }

};

module.exports = usersService;
