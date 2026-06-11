const leconsRepository     = require('../repositories/lecons.repository');
const elevesRepository     = require('../repositories/eleves.repository');
const moniteursRepository  = require('../repositories/moniteurs.repository');
const calendrierRepository = require('../repositories/calendrier.repository');

function conflict(message) {
  const err = new Error(message);
  err.status = 409;
  return err;
}

async function validerCreneau(dateHeure) {
  const tousLesCreneaux = await calendrierRepository.getAll();
  const existe = tousLesCreneaux.some(
    c => new Date(c.dateHeure).getTime() === new Date(dateHeure).getTime()
  );
  if (!existe) {
    const err = new Error('Ce créneau n\'existe pas dans le calendrier');
    err.status = 400;
    throw err;
  }
}

const leconsService = {

  async getAll() {
    return leconsRepository.getAll();
  },

  async getByEleve(idEleve) {
    const eleve = await elevesRepository.getById(idEleve);
    if (!eleve) {
      const err = new Error('Elève introuvable'); err.status = 404; throw err;
    }
    return leconsRepository.getByEleve(idEleve);
  },

  async getByMoniteur(idMoniteur) {
    const moniteur = await moniteursRepository.getById(idMoniteur);
    if (!moniteur) {
      const err = new Error('Moniteur introuvable'); err.status = 404; throw err;
    }
    return leconsRepository.getByMoniteur(idMoniteur);
  },

  async create(data) {
    const eleve = await elevesRepository.getById(data.idEleve);
    if (!eleve) {
      const err = new Error('Elève introuvable'); err.status = 404; throw err;
    }

    const moniteur = await moniteursRepository.getById(data.idMoniteur);
    if (!moniteur) {
      const err = new Error('Moniteur introuvable'); err.status = 404; throw err;
    }
    if (!moniteur.activite) throw conflict('Ce moniteur est inactif');

    await validerCreneau(data.dateHeure);

    const lecons = await leconsRepository.getAll();
    if (lecons.some(l => l.idEleve === data.idEleve && new Date(l.dateHeure).getTime() === new Date(data.dateHeure).getTime()))
      throw conflict('L\'élève a déjà une leçon sur ce créneau');

    if (lecons.some(l => l.idMoniteur === data.idMoniteur && new Date(l.dateHeure).getTime() === new Date(data.dateHeure).getTime()))
      throw conflict('Le moniteur a déjà une leçon sur ce créneau');

    // Nouvelle leçon : leconEffectuee = 0 (ne compte pas tant qu'elle n'est pas validée).
    await leconsRepository.create(data);
  },

  async update(pk, data) {
    await leconsRepository.update(pk, { duree: data.duree });
  },

  // Valide une leçon : passe leconEffectuee à 1 et incrémente le compteur de l'élève
  // (uniquement lors de la transition 0→1, jamais décrémenté).
  async valider(pk) {
    const changed = await leconsRepository.valider(pk);
    if (changed > 0) {
      await elevesRepository.incrementNbLecon(pk.idEleve);
    }
    return changed > 0;
  },

  async delete(pk) {
    await leconsRepository.delete(pk);
  }

};

module.exports = leconsService;
