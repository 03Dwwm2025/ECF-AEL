const { pool, poolConnect, sql } = require('../config/db');
const Eleve = require('../models/Eleve');

const elevesRepository = {

  async getAll() {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM ELEVE');
    return result.recordset.map(row => new Eleve(row));
  },

  async getById(id) {
    await poolConnect;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM ELEVE WHERE idEleve = @id');
    if (!result.recordset[0]) return null;
    return new Eleve(result.recordset[0]);
  },

  async create(eleve) {
    await poolConnect;
    const newIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(idEleve), 0) + 1 AS newId FROM ELEVE');
    const newId = newIdResult.recordset[0].newId;

    await pool.request()
      .input('id', sql.Int, newId)
      .input('nom', sql.VarChar, eleve.nomEleve)
      .input('prenom', sql.VarChar, eleve.prenomEleve)
      .input('telephone', sql.VarChar, eleve.telephone ?? null)
      .input('code', sql.Int, eleve.code)
      .input('conduite', sql.Int, eleve.conduite)
      .input('dateNaissance', sql.Date, eleve.dateNaissance)
      .input('dateInscription', sql.Date, eleve.dateInscription)
      .query(`
        INSERT INTO ELEVE (idEleve, nomEleve, prenomEleve, telephone, code, conduite, dateNaissance, dateInscription)
        VALUES (@id, @nom, @prenom, @telephone, @code, @conduite, @dateNaissance, @dateInscription)
      `);
    return newId;
  },

  async update(id, eleve) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('nom', sql.VarChar, eleve.nomEleve)
      .input('prenom', sql.VarChar, eleve.prenomEleve)
      .input('telephone', sql.VarChar, eleve.telephone ?? null)
      .input('code', sql.Int, eleve.code)
      .input('conduite', sql.Int, eleve.conduite)
      .input('dateNaissance', sql.Date, eleve.dateNaissance)
      .input('dateInscription', sql.Date, eleve.dateInscription)
      .query(`
        UPDATE ELEVE SET
          nomEleve = @nom,
          prenomEleve = @prenom,
          telephone = @telephone,
          code = @code,
          conduite = @conduite,
          dateNaissance = @dateNaissance,
          dateInscription = @dateInscription
        WHERE idEleve = @id
      `);
  },

  // nbLecon est piloté uniquement par les leçons (jamais via l'API élève).
  async incrementNbLecon(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE ELEVE SET nbLecon = nbLecon + 1 WHERE idEleve = @id');
  },

  async delete(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM ELEVE WHERE idEleve = @id');
  }

};
module.exports = elevesRepository;