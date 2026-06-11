const { pool, poolConnect, sql } = require('../config/db');
const Vehicule = require('../models/Vehicule');

const vehiculesRepository = {

  async getAll() {
    await poolConnect;
    const result = await pool.request()
      .query(`
        SELECT v.numImmat, v.idModele, v.annee, v.dateAchat, v.etat, m.modeleVehicule, m.marque
        FROM VEHICULE v
        INNER JOIN MODELE m ON m.idModele = v.idModele
      `);
    return result.recordset.map(row => new Vehicule(row));
  },

  async getById(numImmat) {
    await poolConnect;
    const result = await pool.request()
      .input('numImmat', sql.VarChar, numImmat)
      .query(`
        SELECT v.numImmat, v.idModele, v.annee, v.dateAchat, v.etat, m.modeleVehicule, m.marque
        FROM VEHICULE v
        INNER JOIN MODELE m ON m.idModele = v.idModele
        WHERE v.numImmat = @numImmat
      `);
    if (!result.recordset[0]) return null;
    return new Vehicule(result.recordset[0]);
  },

  async create(vehicule) {
    await poolConnect;
    await pool.request()
      .input('numImmat', sql.VarChar, vehicule.numImmat)
      .input('idModele', sql.Int, vehicule.idModele)
      .input('annee', sql.Int, vehicule.annee)
      .input('dateAchat', sql.Date, vehicule.dateAchat)
      .input('etat', sql.Bit, vehicule.etat)
      .query(`
        INSERT INTO VEHICULE (numImmat, idModele, annee, dateAchat, etat)
        VALUES (@numImmat, @idModele, @annee, @dateAchat, @etat)
      `);
    return vehiculesRepository.getById(vehicule.numImmat);
  },

  async update(numImmat, vehicule) {
    await poolConnect;
    await pool.request()
      .input('numImmat', sql.VarChar, numImmat)
      .input('idModele', sql.Int, vehicule.idModele)
      .input('annee', sql.Int, vehicule.annee)
      .input('dateAchat', sql.Date, vehicule.dateAchat)
      .input('etat', sql.Bit, vehicule.etat)
      .query(`
        UPDATE VEHICULE SET
          idModele  = @idModele,
          annee     = @annee,
          dateAchat = @dateAchat,
          etat      = @etat
        WHERE numImmat = @numImmat
      `);
  },

  async delete(numImmat) {
    await poolConnect;
    await pool.request()
      .input('numImmat', sql.VarChar, numImmat)
      .query('DELETE FROM VEHICULE WHERE numImmat = @numImmat');
  }

};

module.exports = vehiculesRepository;
