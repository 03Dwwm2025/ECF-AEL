const usersService = require('../services/users.service');

const usersController = {

  async getAll(req, res, next) {
    try {
      res.json(await usersService.getAll());
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      res.json(await usersService.getById(parseInt(req.params.id)));
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      res.json(await usersService.update(parseInt(req.params.id), req.body));
    } catch (err) { next(err); }
  },

  async updatePassword(req, res, next) {
    try {
      const { ancienMdp, nouveauMdp } = req.body;
      await usersService.updatePassword(parseInt(req.params.id), ancienMdp, nouveauMdp);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await usersService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  }

};

module.exports = usersController;
