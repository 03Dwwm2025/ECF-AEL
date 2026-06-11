const bcrypt = require('bcrypt');
const moniteursRepository = require('../repositories/moniteurs.repository');
const userRepository = require('../repositories/user.repository');
const leconsRepository = require('../repositories/lecons.repository');

const SALT_ROUNDS = 10;

function notFound() {
  const err = new Error('Moniteur introuvable');
  err.status = 404;
  return err;
}

const moniteursService = {

  async getAll() {
    return moniteursRepository.getAll();
  },

  async getById(id) {
    const moniteur = await moniteursRepository.getById(id);
    if (!moniteur) throw notFound();
    return moniteur;
  },

  async create(data) {
    const hash = await bcrypt.hash(data.mdp, SALT_ROUNDS);
    const idUser = await userRepository.create({
      email: data.email,
      mdp: hash,
      role: 'moniteur',
      nom: data.nom,
      prenom: data.prenom,
      dateNaissance: data.dateNaissance
    });
    const idMoniteur = await moniteursRepository.create(idUser, {
      dateEmbauche: data.dateEmbauche,
      activite: data.activite ?? true
    });
    return moniteursRepository.getById(idMoniteur);
  },

  async update(id, data) {
    const moniteur = await moniteursRepository.getById(id);
    if (!moniteur) throw notFound();

    await userRepository.update(moniteur.idUser, {
      email: data.email ?? moniteur.email,
      nom: data.nom ?? moniteur.nom,
      prenom: data.prenom ?? moniteur.prenom,
      dateNaissance: data.dateNaissance ?? moniteur.dateNaissance
    });
    await moniteursRepository.update(id, {
      dateEmbauche: data.dateEmbauche ?? moniteur.dateEmbauche,
      activite: data.activite ?? moniteur.activite
    });
    return moniteursRepository.getById(id);
  },

  async delete(id) {
    const moniteur = await moniteursRepository.getById(id);
    if (!moniteur) throw notFound();
    const lecons = await leconsRepository.getByMoniteur(id);
    if (lecons.length > 0) {
      const err = new Error('Impossible de supprimer : ce moniteur a des leçons enregistrées');
      err.status = 409;
      throw err;
    }
    await moniteursRepository.delete(id);
    await userRepository.delete(moniteur.idUser);
  }

};

module.exports = moniteursService;
