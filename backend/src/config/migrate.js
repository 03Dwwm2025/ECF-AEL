require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool, poolConnect } = require('./db');

async function migrate() {
  await poolConnect;

  // --- MIGRATION 1 : table USER + modification MONITEUR ---
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='USER' AND xtype='U')
    CREATE TABLE [USER] (
      idUser      INT IDENTITY(1,1) PRIMARY KEY,
      email       VARCHAR(255) NOT NULL UNIQUE,
      mdp         VARCHAR(255) NOT NULL,
      role        VARCHAR(20)  NOT NULL CHECK (role IN ('moniteur', 'secretaire')),
      nom         VARCHAR(100) NOT NULL,
      prenom      VARCHAR(100) NOT NULL,
      dateNaissance DATE        NOT NULL
    )
  `);
  console.log('Table USER : OK');

  await pool.request().query(`
    IF NOT EXISTS (
      SELECT * FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'MONITEUR' AND COLUMN_NAME = 'idUser'
    )
    ALTER TABLE MONITEUR ADD idUser INT NULL REFERENCES [USER](idUser)
  `);
  console.log('Colonne MONITEUR.idUser : OK');

  for (const col of ['nomMoniteur', 'prenomMoniteur', 'dateNaissance']) {
    await pool.request().query(`
      IF EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'MONITEUR' AND COLUMN_NAME = '${col}'
      )
      ALTER TABLE MONITEUR DROP COLUMN ${col}
    `);
    console.log(`MONITEUR.${col} supprimée : OK`);
  }

  // --- MIGRATION 3 : idModele comme PK de MODELE ---
  const hasIdModele = await pool.request().query(`
    SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'MODELE' AND COLUMN_NAME = 'idModele'
  `);

  if (hasIdModele.recordset[0].cnt === 0) {
    // Supprimer les FK qui référencent MODELE avant de changer sa PK
    const fksVersModele = await pool.request().query(`
      SELECT tc.TABLE_NAME, tc.CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc ON tc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc2 ON rc.UNIQUE_CONSTRAINT_NAME = tc2.CONSTRAINT_NAME
      WHERE tc2.TABLE_NAME = 'MODELE' AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    `);
    for (const fk of fksVersModele.recordset) {
      await pool.request().query(`ALTER TABLE [${fk.TABLE_NAME}] DROP CONSTRAINT [${fk.CONSTRAINT_NAME}]`);
      console.log(`FK ${fk.TABLE_NAME}.${fk.CONSTRAINT_NAME} supprimée`);
    }

    await pool.request().query(`ALTER TABLE MODELE ADD idModele INT IDENTITY(1,1)`);
    console.log('MODELE.idModele ajouté');

    const pkModele = await pool.request().query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'MODELE' AND CONSTRAINT_TYPE = 'PRIMARY KEY'
    `);
    if (pkModele.recordset[0]) {
      await pool.request().query(`ALTER TABLE MODELE DROP CONSTRAINT [${pkModele.recordset[0].CONSTRAINT_NAME}]`);
      console.log('Ancienne PK MODELE supprimée');
    }

    await pool.request().query(`ALTER TABLE MODELE ADD CONSTRAINT PK_MODELE PRIMARY KEY (idModele)`);
    console.log('Nouvelle PK MODELE (idModele) : OK');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_NAME = 'UQ_MODELE_NOM')
      ALTER TABLE MODELE ADD CONSTRAINT UQ_MODELE_NOM UNIQUE (modeleVehicule)
    `);
    console.log('UNIQUE MODELE.modeleVehicule : OK');
  } else {
    console.log('MODELE.idModele existe déjà, skip');
  }

  // --- MIGRATION 4 : VEHICULE.modeleVehicule → idModele INT ---
  const hasVehiculeIdModele = await pool.request().query(`
    SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'VEHICULE' AND COLUMN_NAME = 'idModele'
  `);

  if (hasVehiculeIdModele.recordset[0].cnt === 0) {
    await pool.request().query(`ALTER TABLE VEHICULE ADD idModele INT NULL`);

    await pool.request().query(`
      UPDATE v SET v.idModele = m.idModele
      FROM VEHICULE v
      INNER JOIN MODELE m ON LTRIM(RTRIM(v.modeleVehicule)) = LTRIM(RTRIM(m.modeleVehicule))
    `);
    console.log('VEHICULE.idModele peuplé');

    const fkVehicule = await pool.request().query(`
      SELECT tc.CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE tc.TABLE_NAME = 'VEHICULE' AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND kcu.COLUMN_NAME = 'modeleVehicule'
    `);
    if (fkVehicule.recordset[0]) {
      await pool.request().query(`ALTER TABLE VEHICULE DROP CONSTRAINT [${fkVehicule.recordset[0].CONSTRAINT_NAME}]`);
    }

    await pool.request().query(`ALTER TABLE VEHICULE DROP COLUMN modeleVehicule`);
    console.log('VEHICULE.modeleVehicule supprimée');

    await pool.request().query(`ALTER TABLE VEHICULE ALTER COLUMN idModele INT NOT NULL`);
    await pool.request().query(`
      ALTER TABLE VEHICULE ADD CONSTRAINT FK_VEHICULE_MODELE
      FOREIGN KEY (idModele) REFERENCES MODELE(idModele)
    `);
    console.log('FK VEHICULE → MODELE : OK');
  } else {
    console.log('VEHICULE.idModele existe déjà, skip');
  }

  // --- MIGRATION 5 : LECON.modeleVehiculeLecon → idModele INT ---
  const hasLeconIdModele = await pool.request().query(`
    SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'LECON' AND COLUMN_NAME = 'idModele'
  `);

  if (hasLeconIdModele.recordset[0].cnt === 0) {
    await pool.request().query(`ALTER TABLE LECON ADD idModele INT NULL`);

    await pool.request().query(`
      UPDATE l SET l.idModele = m.idModele
      FROM LECON l
      INNER JOIN MODELE m ON LTRIM(RTRIM(l.modeleVehiculeLecon)) = LTRIM(RTRIM(m.modeleVehicule))
    `);
    console.log('LECON.idModele peuplé');

    const pkLecon = await pool.request().query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'LECON' AND CONSTRAINT_TYPE = 'PRIMARY KEY'
    `);
    if (pkLecon.recordset[0]) {
      await pool.request().query(`ALTER TABLE LECON DROP CONSTRAINT [${pkLecon.recordset[0].CONSTRAINT_NAME}]`);
      console.log('Ancienne PK LECON supprimée');
    }

    const fkLecon = await pool.request().query(`
      SELECT tc.CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE tc.TABLE_NAME = 'LECON' AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND kcu.COLUMN_NAME = 'modeleVehiculeLecon'
    `);
    if (fkLecon.recordset[0]) {
      await pool.request().query(`ALTER TABLE LECON DROP CONSTRAINT [${fkLecon.recordset[0].CONSTRAINT_NAME}]`);
    }

    await pool.request().query(`ALTER TABLE LECON DROP COLUMN modeleVehiculeLecon`);
    console.log('LECON.modeleVehiculeLecon supprimée');

    await pool.request().query(`ALTER TABLE LECON ALTER COLUMN idModele INT NOT NULL`);
    await pool.request().query(`
      ALTER TABLE LECON ADD CONSTRAINT PK_LECON
      PRIMARY KEY (idModele, dateHeureLecon, idEleveLecon, idMoniteurLecon)
    `);
    console.log('Nouvelle PK LECON : OK');

    await pool.request().query(`
      ALTER TABLE LECON ADD CONSTRAINT FK_LECON_MODELE
      FOREIGN KEY (idModele) REFERENCES MODELE(idModele)
    `);
    console.log('FK LECON → MODELE : OK');
  } else {
    console.log('LECON.idModele existe déjà, skip');
  }

  console.log('\nMigration terminée.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Erreur migration :', err.message);
  process.exit(1);
});
