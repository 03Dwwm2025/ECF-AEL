const { pool, poolConnect, sql } = require('../config/db');
const User = require('../models/User');

const userRepository = {

  async getAll() {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM [USER]');
    return result.recordset.map(row => new User(row));
  },

  async getById(id) {
    await poolConnect;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM [USER] WHERE idUser = @id');
    if (!result.recordset[0]) return null;
    return new User(result.recordset[0]);
  },

  async getByEmail(email) {
    await poolConnect;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM [USER] WHERE email = @email');
    return result.recordset[0] || null;
  },

  async create(user) {
    await poolConnect;
    const result = await pool.request()
      .input('email', sql.VarChar, user.email)
      .input('mdp', sql.VarChar, user.mdp)
      .input('role', sql.VarChar, user.role)
      .input('nom', sql.VarChar, user.nom)
      .input('prenom', sql.VarChar, user.prenom)
      .input('dateNaissance', sql.Date, user.dateNaissance)
      .query(`
        INSERT INTO [USER] (email, mdp, role, nom, prenom, dateNaissance)
        OUTPUT INSERTED.idUser
        VALUES (@email, @mdp, @role, @nom, @prenom, @dateNaissance)
      `);
    return result.recordset[0].idUser;
  },

  async update(id, user) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('email', sql.VarChar, user.email)
      .input('nom', sql.VarChar, user.nom)
      .input('prenom', sql.VarChar, user.prenom)
      .input('dateNaissance', sql.Date, user.dateNaissance)
      .query(`
        UPDATE [USER] SET
          email         = @email,
          nom           = @nom,
          prenom        = @prenom,
          dateNaissance = @dateNaissance
        WHERE idUser = @id
      `);
  },

  async updatePassword(id, mdp) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('mdp', sql.VarChar, mdp)
      .query('UPDATE [USER] SET mdp = @mdp WHERE idUser = @id');
  },

  async delete(id) {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM [USER] WHERE idUser = @id');
  }

};

module.exports = userRepository;
