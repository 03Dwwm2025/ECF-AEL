const leconsService = require('../services/lecons.service');

const leconsController = {

  async getAll(req, res, next) {
    try {
      res.json(await leconsService.getAll());
    } catch (err) { next(err); }
  },

  async getByEleve(req, res, next) {
    try {
      res.json(await leconsService.getByEleve(parseInt(req.params.idEleve)));
    } catch (err) { next(err); }
  },

  async getByMoniteur(req, res, next) {
    try {
      res.json(await leconsService.getByMoniteur(parseInt(req.params.idMoniteur)));
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      await leconsService.create(req.body);
      res.status(201).send();
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const { pk, data } = req.body;
      await leconsService.update(pk, data);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async valider(req, res, next) {
    try {
      const valide = await leconsService.valider(req.body);
      res.json({ valide });
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await leconsService.delete(req.body);
      res.status(204).send();
    } catch (err) { next(err); }
  }

};

module.exports = leconsController;
