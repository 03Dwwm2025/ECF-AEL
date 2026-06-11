const vehiculesRepository = require('../repositories/vehicules.repository');
const modelesRepository = require('../repositories/modeles.repository');

function notFound() {
  const err = new Error('Véhicule introuvable');
  err.status = 404;
  return err;
}

const vehiculesService = {

  async getAll() {
    return vehiculesRepository.getAll();
  },

  async getById(numImmat) {
    const vehicule = await vehiculesRepository.getById(numImmat);
    if (!vehicule) throw notFound();
    return vehicule;
  },

  async create(data) {
    const modele = await modelesRepository.getById(data.idModele);
    if (!modele) {
      const err = new Error('Modèle de véhicule introuvable');
      err.status = 400;
      throw err;
    }
    return vehiculesRepository.create({
      numImmat:  data.numImmat,
      idModele:  data.idModele,
      annee:     data.annee,
      dateAchat: data.dateAchat,
      etat:      data.etat ?? true
    });
  },

  async update(numImmat, data) {
    const vehicule = await vehiculesRepository.getById(numImmat);
    if (!vehicule) throw notFound();

    if (data.idModele !== undefined) {
      const modele = await modelesRepository.getById(data.idModele);
      if (!modele) {
        const err = new Error('Modèle de véhicule introuvable');
        err.status = 400;
        throw err;
      }
    }

    await vehiculesRepository.update(numImmat, {
      idModele:  data.idModele  ?? vehicule.idModele,
      annee:     data.annee     ?? vehicule.annee,
      dateAchat: data.dateAchat ?? vehicule.dateAchat,
      etat:      data.etat      ?? vehicule.etat
    });
    return vehiculesRepository.getById(numImmat);
  },

  async delete(numImmat) {
    const vehicule = await vehiculesRepository.getById(numImmat);
    if (!vehicule) throw notFound();
    await vehiculesRepository.delete(numImmat);
  }

};

module.exports = vehiculesService;
