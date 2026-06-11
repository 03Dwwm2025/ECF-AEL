const { pool, poolConnect, sql } = require('../config/db');
const Lecon = require('../models/Lecon');

const leconsRepository = {

  async getAll() {
    await poolConnect;
    const result = await pool.request()
      .query(`
        SELECT l.idModele, l.dateHeureLecon, l.idEleveLecon, l.idMoniteurLecon, l.duree, l.leconEffectuee,
               m.modeleVehicule
        FROM LECON l
        INNER JOIN MODELE m ON m.idModele = l.idModele
      `);
    return result.recordset.map(row => new Lecon(row));
  },

  async getByEleve(idEleve) {
    await poolConnect;
    const result = await pool.request()
      .input('idEleve', sql.Int, idEleve)
      .query(`
        SELECT l.idModele, l.dateHeureLecon, l.idEleveLecon, l.idMoniteurLecon, l.duree, l.leconEffectuee,
               m.modeleVehicule
        FROM LECON l
        INNER JOIN MODELE m ON m.idModele = l.idModele
        WHERE l.idEleveLecon = @idEleve
      `);
    return result.recordset.map(row => new Lecon(row));
  },

  async getByMoniteur(idMoniteur) {
    await poolConnect;
    const result = await pool.request()
      .input('idMoniteur', sql.Int, idMoniteur)
      .query(`
        SELECT l.idModele, l.dateHeureLecon, l.idEleveLecon, l.idMoniteurLecon, l.duree, l.leconEffectuee,
               m.modeleVehicule
        FROM LECON l
        INNER JOIN MODELE m ON m.idModele = l.idModele
        WHERE l.idMoniteurLecon = @idMoniteur
      `);
    return result.recordset.map(row => new Lecon(row));
  },

  async create(lecon) {
    await poolConnect;
    await pool.request()
      .input('idModele', sql.Int, lecon.idModele)
      .input('dateHeure', sql.DateTime, lecon.dateHeure)
      .input('idEleve', sql.Int, lecon.idEleve)
      .input('idMoniteur', sql.Int, lecon.idMoniteur)
      .input('duree', sql.Int, lecon.duree)
      .query(`
        INSERT INTO LECON (idModele, dateHeureLecon, idEleveLecon, idMoniteurLecon, duree)
        VALUES (@idModele, @dateHeure, @idEleve, @idMoniteur, @duree)
      `);
  },

  async update(pk, lecon) {
    await poolConnect;
    await pool.request()
      .input('idModele', sql.Int, pk.idModele)
      .input('dateHeure', sql.DateTime, pk.dateHeure)
      .input('idEleve', sql.Int, pk.idEleve)
      .input('idMoniteur', sql.Int, pk.idMoniteur)
      .input('duree', sql.Int, lecon.duree)
      .query(`
        UPDATE LECON SET duree = @duree
        WHERE idModele        = @idModele
          AND dateHeureLecon  = @dateHeure
          AND idEleveLecon    = @idEleve
          AND idMoniteurLecon = @idMoniteur
      `);
  },

  async delete(pk) {
    await poolConnect;
    await pool.request()
      .input('idModele', sql.Int, pk.idModele)
      .input('dateHeure', sql.DateTime, pk.dateHeure)
      .input('idEleve', sql.Int, pk.idEleve)
      .input('idMoniteur', sql.Int, pk.idMoniteur)
      .query(`
        DELETE FROM LECON
        WHERE idModele        = @idModele
          AND dateHeureLecon  = @dateHeure
          AND idEleveLecon    = @idEleve
          AND idMoniteurLecon = @idMoniteur
      `);
  },

  // Passe leconEffectuee à 1 si ce n'était pas déjà le cas.
  // Renvoie le nombre de lignes modifiées (1 si transition 0→1, 0 sinon).
  async valider(pk) {
    await poolConnect;
    const result = await pool.request()
      .input('idModele', sql.Int, pk.idModele)
      .input('dateHeure', sql.DateTime, pk.dateHeure)
      .input('idEleve', sql.Int, pk.idEleve)
      .input('idMoniteur', sql.Int, pk.idMoniteur)
      .query(`
        UPDATE LECON SET leconEffectuee = 1
        WHERE idModele        = @idModele
          AND dateHeureLecon  = @dateHeure
          AND idEleveLecon    = @idEleve
          AND idMoniteurLecon = @idMoniteur
          AND leconEffectuee  = 0
      `);
    return result.rowsAffected[0];
  }

};

module.exports = leconsRepository;
