const { pool, poolConnect, sql } = require('../config/db');
const Calendrier = require('../models/Calendrier');

const calendrierRepository = {

  async getAll() {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM CALENDRIER ORDER BY dateHeure');
    return result.recordset.map(row => new Calendrier(row));
  },

  async getAvailable() {
    await poolConnect;
    const result = await pool.request()
      .query(`
        SELECT c.dateHeure FROM CALENDRIER c
        WHERE c.dateHeure NOT IN (SELECT dateHeureLecon FROM LECON)
        ORDER BY c.dateHeure
      `);
    return result.recordset.map(row => new Calendrier(row));
  }

};

module.exports = calendrierRepository;
