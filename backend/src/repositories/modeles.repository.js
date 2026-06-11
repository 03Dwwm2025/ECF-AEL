const { pool, poolConnect, sql } = require('../config/db');
const Modele = require('../models/Modele');

const modelesRepository = {

  async getAll() {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM MODELE');
    return result.recordset.map(row => new Modele(row));
  },

  async getById(id) {
    await poolConnect;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM MODELE WHERE idModele = @id');
    if (!result.recordset[0]) return null;
    return new Modele(result.recordset[0]);
  },

  async create(modele) {
    await poolConnect;
    const result = await pool.request()
      .input('modeleVehicule', sql.VarChar, modele.modeleVehicule)
      .input('marque', sql.VarChar, modele.marque)
      .query(`
        INSERT INTO MODELE (modeleVehicule, marque)
        OUTPUT INSERTED.idModele
        VALUES (@modeleVehicule, @marque)
      `);
    return result.recordset[0].idModele;
  },

  async update(id, modele) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('modeleVehicule', sql.VarChar, modele.modeleVehicule)
      .input('marque', sql.VarChar, modele.marque)
      .query(`
        UPDATE MODELE SET
          modeleVehicule = @modeleVehicule,
          marque         = @marque
        WHERE idModele = @id
      `);
  },

  async delete(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM MODELE WHERE idModele = @id');
  }

};

module.exports = modelesRepository;
