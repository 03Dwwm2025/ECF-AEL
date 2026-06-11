const authService = require('../services/auth.service');

const authController = {

  async login(req, res, next) {
    try {
      const { email, mdp } = req.body;
      const token = await authService.login(email, mdp);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }

};

module.exports = authController;
