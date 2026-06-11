const modelesRepository = require('../repositories/modeles.repository');
const vehiculesRepository = require('../repositories/vehicules.repository');

function notFound() {
  const err = new Error('Modèle introuvable');
  err.status = 404;
  return err;
}

const modelesService = {

  async getAll() {
    return modelesRepository.getAll();
  },

  async getById(id) {
    const modele = await modelesRepository.getById(id);
    if (!modele) throw notFound();
    return modele;
  },

  async create(data) {
    const id = await modelesRepository.create(data);
    return modelesRepository.getById(id);
  },

  async update(id, data) {
    const modele = await modelesRepository.getById(id);
    if (!modele) throw notFound();
    await modelesRepository.update(id, {
      modeleVehicule: data.modeleVehicule ?? modele.modeleVehicule,
      marque:         data.marque         ?? modele.marque
    });
    return modelesRepository.getById(id);
  },

  async delete(id) {
    const modele = await modelesRepository.getById(id);
    if (!modele) throw notFound();

    const vehicules = await vehiculesRepository.getAll();
    if (vehicules.some(v => v.idModele === id)) {
      const err = new Error('Impossible de supprimer : des véhicules utilisent ce modèle');
      err.status = 409;
      throw err;
    }

    await modelesRepository.delete(id);
  }

};

module.exports = modelesService;
