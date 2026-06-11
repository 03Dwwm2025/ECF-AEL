const vehiculesService = require('../services/vehicules.service');

const vehiculesController = {

  async getAll(req, res, next) {
    try {
      res.json(await vehiculesService.getAll());
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      res.json(await vehiculesService.getById(req.params.numImmat));
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      res.status(201).json(await vehiculesService.create(req.body));
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      res.json(await vehiculesService.update(req.params.numImmat, req.body));
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await vehiculesService.delete(req.params.numImmat);
      res.status(204).send();
    } catch (err) { next(err); }
  }

};

module.exports = vehiculesController;
