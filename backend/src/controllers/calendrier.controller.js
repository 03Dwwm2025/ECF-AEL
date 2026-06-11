const calendrierService = require('../services/calendrier.service');

const calendrierController = {

  async getAll(req, res, next) {
    try {
      res.json(await calendrierService.getAll());
    } catch (err) { next(err); }
  },

  async getAvailable(req, res, next) {
    try {
      res.json(await calendrierService.getAvailable());
    } catch (err) { next(err); }
  }

};

module.exports = calendrierController;
