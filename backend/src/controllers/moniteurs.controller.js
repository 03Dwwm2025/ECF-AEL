const moniteursService = require('../services/moniteurs.service');

const moniteursController = {

  async getAll(req, res, next) {
    try {
      res.json(await moniteursService.getAll());
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      res.json(await moniteursService.getById(parseInt(req.params.id)));
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      res.status(201).json(await moniteursService.create(req.body));
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      res.json(await moniteursService.update(parseInt(req.params.id), req.body));
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await moniteursService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  }

};

module.exports = moniteursController;
