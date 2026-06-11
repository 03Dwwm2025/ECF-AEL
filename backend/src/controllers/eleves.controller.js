const elevesService = require('../services/eleves.service');

const elevesController = {

  async getAll(req, res, next) {
    try {
      res.json(await elevesService.getAll());
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      res.json(await elevesService.getById(parseInt(req.params.id)));
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      res.status(201).json(await elevesService.create(req.body));
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      res.json(await elevesService.update(parseInt(req.params.id), req.body));
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await elevesService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  }

};

module.exports = elevesController;
