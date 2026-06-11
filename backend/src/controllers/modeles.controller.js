const modelesService = require('../services/modeles.service');

const modelesController = {

  async getAll(req, res, next) {
    try {
      res.json(await modelesService.getAll());
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      res.json(await modelesService.getById(parseInt(req.params.id)));
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      res.status(201).json(await modelesService.create(req.body));
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      res.json(await modelesService.update(parseInt(req.params.id), req.body));
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await modelesService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  }

};

module.exports = modelesController;
