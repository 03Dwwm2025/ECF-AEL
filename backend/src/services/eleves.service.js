const elevesRepository = require('../repositories/eleves.repository');
const leconsRepository = require('../repositories/lecons.repository');

function notFound() {
  const err = new Error('Elève introuvable');
  err.status = 404;
  return err;
}

const elevesService = {

  async getAll() {
    return elevesRepository.getAll();
  },

  async getById(id) {
    const eleve = await elevesRepository.getById(id);
    if (!eleve) throw notFound();
    return eleve;
  },

  async create(data) {
    const id = await elevesRepository.create({
      nomEleve: data.nomEleve,
      prenomEleve: data.prenomEleve,
      telephone: data.telephone ?? null,
      code: data.code ?? false,
      conduite: data.conduite ?? false,
      dateNaissance: data.dateNaissance,
      dateInscription: data.dateInscription
    });
    return elevesRepository.getById(id);
  },

  async update(id, data) {
    const eleve = await elevesRepository.getById(id);
    if (!eleve) throw notFound();
    await elevesRepository.update(id, {
      nomEleve: data.nomEleve ?? eleve.nomEleve,
      prenomEleve: data.prenomEleve ?? eleve.prenomEleve,
      // null explicite autorisé (permet de vider le téléphone) ; undefined garde l'existant
      telephone: data.telephone !== undefined ? data.telephone : eleve.telephone,
      code: data.code ?? eleve.code,
      conduite: data.conduite ?? eleve.conduite,
      dateNaissance: data.dateNaissance ?? eleve.dateNaissance,
      dateInscription: data.dateInscription ?? eleve.dateInscription
    });
    return elevesRepository.getById(id);
  },

  async delete(id) {
    const eleve = await elevesRepository.getById(id);
    if (!eleve) throw notFound();
    const lecons = await leconsRepository.getByEleve(id);
    if (lecons.length > 0) {
      const err = new Error('Impossible de supprimer : cet élève a des leçons enregistrées');
      err.status = 409;
      throw err;
    }
    await elevesRepository.delete(id);
  }

};

module.exports = elevesService;
