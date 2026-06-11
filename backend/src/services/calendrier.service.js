const calendrierRepository = require('../repositories/calendrier.repository');

const calendrierService = {

  async getAll() {
    return calendrierRepository.getAll();
  },

  async getAvailable() {
    return calendrierRepository.getAvailable();
  }

};

module.exports = calendrierService;
