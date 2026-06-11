const { pool, poolConnect, sql } = require('../config/db');
const Moniteur = require('../models/Moniteur');

const moniteursRepository = {

  async getAll() {
    await poolConnect;
    const result = await pool.request()
      .query(`
        SELECT m.idMoniteur, m.dateEmbauche, m.activite, m.idUser,
               u.nom, u.prenom, u.email, u.dateNaissance
        FROM MONITEUR m
        INNER JOIN [USER] u ON u.idUser = m.idUser
      `);
    return result.recordset.map(row => new Moniteur(row));
  },

  async getById(id) {
    await poolConnect;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT m.idMoniteur, m.dateEmbauche, m.activite, m.idUser,
               u.nom, u.prenom, u.email, u.dateNaissance
        FROM MONITEUR m
        INNER JOIN [USER] u ON u.idUser = m.idUser
        WHERE m.idMoniteur = @id
      `);
    if (!result.recordset[0]) return null;
    return new Moniteur(result.recordset[0]);
  },

  async create(idUser, moniteur) {
    await poolConnect;
    const newIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(idMoniteur), 0) + 1 AS newId FROM MONITEUR');
    const newId = newIdResult.recordset[0].newId;

    await pool.request()
      .input('id', sql.Int, newId)
      .input('dateEmbauche', sql.Date, moniteur.dateEmbauche)
      .input('activite', sql.Bit, moniteur.activite)
      .input('idUser', sql.Int, idUser)
      .query(`
        INSERT INTO MONITEUR (idMoniteur, dateEmbauche, activite, idUser)
        VALUES (@id, @dateEmbauche, @activite, @idUser)
      `);
    return newId;
  },

  async update(id, moniteur) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('dateEmbauche', sql.Date, moniteur.dateEmbauche)
      .input('activite', sql.Bit, moniteur.activite)
      .query(`
        UPDATE MONITEUR SET
          dateEmbauche = @dateEmbauche,
          activite     = @activite
        WHERE idMoniteur = @id
      `);
  },

  async delete(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM MONITEUR WHERE idMoniteur = @id');
  }

};

module.exports = moniteursRepository;
