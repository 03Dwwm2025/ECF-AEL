--  ECF AEL — Base de données ECF_AEL_CDA  (SQL Server / T-SQL)
--  Script de création du schéma + jeux d'essais.
--
--  Utilisation :
--    1. Créer la base (décommenter ci-dessous) .
--    2. Exécuter ce script entier (SSMS, Azure Data Studio, sqlcmd…).
--  Compte de connexion de démo : admin@admin.fr / admin

-- CREATE DATABASE ECF_AEL_CDA;
-- GO
-- USE ECF_AEL_CDA;
-- GO

CREATE TABLE [USER] (
    idUser        INT IDENTITY(1,1) NOT NULL,
    email         VARCHAR(255)      NOT NULL,
    mdp           VARCHAR(255)      NOT NULL,
    role          VARCHAR(20)       NOT NULL,
    nom           VARCHAR(100)      NOT NULL,
    prenom        VARCHAR(100)      NOT NULL,
    dateNaissance DATE              NOT NULL,
    CONSTRAINT PK_USER PRIMARY KEY (idUser),
    CONSTRAINT CK_USER_role CHECK (role IN ('secretaire', 'moniteur'))
);

CREATE TABLE ELEVE (
    idEleve         INT          NOT NULL,
    nomEleve        VARCHAR(50)  NOT NULL,
    prenomEleve     VARCHAR(50)  NOT NULL,
    code            BIT          NOT NULL,
    conduite        BIT          NOT NULL,
    dateNaissance   DATE         NOT NULL,
    dateInscription DATE         NOT NULL,
    telephone       VARCHAR(20)  NULL,
    nbLecon         INT          NOT NULL CONSTRAINT DF_ELEVE_nbLecon DEFAULT (0),
    CONSTRAINT PK_ELEVE PRIMARY KEY (idEleve)
);

CREATE TABLE MODELE (
    idModele       INT IDENTITY(1,1) NOT NULL,
    modeleVehicule VARCHAR(50)       NOT NULL,
    marque         VARCHAR(50)       NOT NULL,
    CONSTRAINT PK_MODELE PRIMARY KEY (idModele)
);

CREATE TABLE CALENDRIER (
    dateHeure DATETIME NOT NULL,
    CONSTRAINT PK_CALENDRIER PRIMARY KEY (dateHeure)
);

CREATE TABLE MONITEUR (
    idMoniteur   INT  NOT NULL,
    dateEmbauche DATE NOT NULL,
    activite     BIT  NOT NULL,
    idUser       INT  NULL,
    CONSTRAINT PK_MONITEUR PRIMARY KEY (idMoniteur),
    CONSTRAINT FK_MONITEUR_USER FOREIGN KEY (idUser) REFERENCES [USER](idUser)
);

CREATE TABLE VEHICULE (
    numImmat  VARCHAR(9) NOT NULL,
    etat      BIT        NOT NULL,
    idModele  INT        NOT NULL,
    annee     INT        NOT NULL,
    dateAchat DATE       NOT NULL,
    CONSTRAINT PK_VEHICULE PRIMARY KEY (numImmat),
    CONSTRAINT FK_VEHICULE_MODELE FOREIGN KEY (idModele) REFERENCES MODELE(idModele)
);

CREATE TABLE LECON (
    dateHeureLecon  DATETIME NOT NULL,
    idEleveLecon    INT      NOT NULL,
    idMoniteurLecon INT      NOT NULL,
    duree           INT      NOT NULL,
    idModele        INT      NOT NULL,
    leconEffectuee  BIT      NOT NULL CONSTRAINT DF_LECON_leconEffectuee DEFAULT (0),
    CONSTRAINT PK_LECON PRIMARY KEY (idModele, dateHeureLecon, idEleveLecon, idMoniteurLecon),
    CONSTRAINT FK_LECON_CALENDRIER FOREIGN KEY (dateHeureLecon) REFERENCES CALENDRIER(dateHeure),
    CONSTRAINT FK_LECON_ELEVE      FOREIGN KEY (idEleveLecon)    REFERENCES ELEVE(idEleve),
    CONSTRAINT FK_LECON_MODELE     FOREIGN KEY (idModele)        REFERENCES MODELE(idModele),
    CONSTRAINT FK_LECON_MONITEUR   FOREIGN KEY (idMoniteurLecon) REFERENCES MONITEUR(idMoniteur)
);
GO

DECLARE @start DATE = '2026-01-01';
DECLARE @end   DATE = '2027-01-19';
;WITH days AS (
    SELECT @start AS d
    UNION ALL
    SELECT DATEADD(DAY, 1, d) FROM days WHERE d < @end
),
slots AS (
    SELECT DATEADD(HOUR, h.hour, CAST(d AS DATETIME)) AS dt
    FROM days CROSS JOIN (VALUES (8),(9),(10),(11),(13),(14),(15),(16),(17)) AS h(hour)
)
INSERT INTO CALENDRIER (dateHeure)
SELECT dt FROM slots
OPTION (MAXRECURSION 0);
GO

-- USER
SET IDENTITY_INSERT [USER] ON;
INSERT INTO [USER] (idUser, email, mdp, role, nom, prenom, dateNaissance) VALUES (5, 'martin.dupont@ecf.fr', '$2b$10$S.JsTCjl9vSwbsgOgOkErOlvcnF0uksuM3DuB1J5DjcJj9Z22wtGa', 'moniteur', 'Dupont', 'Martin', '1980-04-12');
INSERT INTO [USER] (idUser, email, mdp, role, nom, prenom, dateNaissance) VALUES (6, 'sophie.bernard@ecf.fr', '$2b$10$IzVg2huAg3s/7LGkqLJhVO3EGcUxJbRvEW8uCkbq4axt0wOQV9JnO', 'moniteur', 'Bernard', 'Sophie', '1990-07-23');
INSERT INTO [USER] (idUser, email, mdp, role, nom, prenom, dateNaissance) VALUES (7, 'pierre.martin@ecf.fr', '$2b$10$GyFBtIi1zo09bVVVU3JT7.3dVq8bX6OKGuACcJdyEF5XMJeayhGbi', 'moniteur', 'Martin', 'Pierre', '1975-11-05');
INSERT INTO [USER] (idUser, email, mdp, role, nom, prenom, dateNaissance) VALUES (8, 'julie.admin@ecf.fr', '$2b$10$t4t5h13FVQQBmc5IYiNdUuEVvo6F9IaClu8xJ7udlOngMDnzvj2P6', 'secretaire', 'Admin', 'Julie', '1988-02-28');
INSERT INTO [USER] (idUser, email, mdp, role, nom, prenom, dateNaissance) VALUES (12, 'admin@admin.fr', '$2b$10$PQ4BpdfYqXElGqDHfhgOBOpFeQkAln0IiG6f0L9rKjfzxRQu2ltce', 'secretaire', 'Admin', 'Admin', '1990-01-01');
SET IDENTITY_INSERT [USER] OFF;

-- MODELE
SET IDENTITY_INSERT MODELE ON;
INSERT INTO MODELE (idModele, modeleVehicule, marque) VALUES (1, 'C4 1', 'Citroën');
INSERT INTO MODELE (idModele, modeleVehicule, marque) VALUES (2, 'Clio 1', 'Renault');
INSERT INTO MODELE (idModele, modeleVehicule, marque) VALUES (3, 'Clio 2', 'Renault');
INSERT INTO MODELE (idModele, modeleVehicule, marque) VALUES (4, 'Fiesta 1', 'Ford');
SET IDENTITY_INSERT MODELE OFF;

-- ELEVE
INSERT INTO ELEVE (idEleve, nomEleve, prenomEleve, code, conduite, dateNaissance, dateInscription, telephone, nbLecon) VALUES (1, 'Baran', 'Aldé', 1, 0, '2001-03-13', '2025-01-01', NULL, 3);
INSERT INTO ELEVE (idEleve, nomEleve, prenomEleve, code, conduite, dateNaissance, dateInscription, telephone, nbLecon) VALUES (2, 'Bon', 'Jean', 1, 0, '2000-09-10', '2025-01-01', NULL, 1);
INSERT INTO ELEVE (idEleve, nomEleve, prenomEleve, code, conduite, dateNaissance, dateInscription, telephone, nbLecon) VALUES (3, 'Poette', 'Karim', 0, 0, '2003-12-25', '2025-01-01', NULL, 1);
INSERT INTO ELEVE (idEleve, nomEleve, prenomEleve, code, conduite, dateNaissance, dateInscription, telephone, nbLecon) VALUES (4, 'Notte', 'Julie', 0, 0, '2004-02-16', '2025-01-01', NULL, 1);
INSERT INTO ELEVE (idEleve, nomEleve, prenomEleve, code, conduite, dateNaissance, dateInscription, telephone, nbLecon) VALUES (5, 'Bienu', 'Emma', 0, 0, '2002-06-25', '2025-01-01', NULL, 1);
INSERT INTO ELEVE (idEleve, nomEleve, prenomEleve, code, conduite, dateNaissance, dateInscription, telephone, nbLecon) VALUES (6, 'Ledivinenfan', 'Irénée', 1, 0, '2000-12-25', '2025-01-01', NULL, 1);
INSERT INTO ELEVE (idEleve, nomEleve, prenomEleve, code, conduite, dateNaissance, dateInscription, telephone, nbLecon) VALUES (7, 'Pierre', 'Louis', 0, 0, '1996-07-13', '2026-06-11', '0618374950', 0);

-- MONITEUR
INSERT INTO MONITEUR (idMoniteur, dateEmbauche, activite, idUser) VALUES (1, '2015-12-12', 0, NULL);
INSERT INTO MONITEUR (idMoniteur, dateEmbauche, activite, idUser) VALUES (2, '2015-10-25', 1, NULL);
INSERT INTO MONITEUR (idMoniteur, dateEmbauche, activite, idUser) VALUES (3, '2017-09-11', 1, NULL);
INSERT INTO MONITEUR (idMoniteur, dateEmbauche, activite, idUser) VALUES (4, '2018-07-15', 1, NULL);
INSERT INTO MONITEUR (idMoniteur, dateEmbauche, activite, idUser) VALUES (5, '2018-01-15', 1, 5);
INSERT INTO MONITEUR (idMoniteur, dateEmbauche, activite, idUser) VALUES (6, '2020-03-01', 1, 6);
INSERT INTO MONITEUR (idMoniteur, dateEmbauche, activite, idUser) VALUES (7, '2015-06-10', 0, 7);

-- VEHICULE
INSERT INTO VEHICULE (numImmat, etat, idModele, annee, dateAchat) VALUES ('1 RTT 06', 1, 1, 2019, '2021-03-25');
INSERT INTO VEHICULE (numImmat, etat, idModele, annee, dateAchat) VALUES ('12 FDG 06', 0, 2, 2020, '2021-03-25');
INSERT INTO VEHICULE (numImmat, etat, idModele, annee, dateAchat) VALUES ('19 JDR 06', 1, 4, 2022, '2022-08-23');
INSERT INTO VEHICULE (numImmat, etat, idModele, annee, dateAchat) VALUES ('19 MPM 06', 1, 3, 2021, '2021-03-25');

-- LECON
INSERT INTO LECON (dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, idModele, leconEffectuee) VALUES ('2026-01-06 08:00:00', 2, 6, 90, 1, 1);
INSERT INTO LECON (dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, idModele, leconEffectuee) VALUES ('2026-01-10 08:00:00', 6, 6, 60, 1, 1);
INSERT INTO LECON (dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, idModele, leconEffectuee) VALUES ('2026-07-10 11:00:00', 1, 6, 90, 1, 1);
INSERT INTO LECON (dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, idModele, leconEffectuee) VALUES ('2026-01-05 08:00:00', 1, 5, 60, 2, 1);
INSERT INTO LECON (dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, idModele, leconEffectuee) VALUES ('2026-01-09 08:00:00', 5, 5, 90, 2, 1);
INSERT INTO LECON (dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, idModele, leconEffectuee) VALUES ('2026-08-29 08:00:00', 1, 6, 90, 2, 1);
INSERT INTO LECON (dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, idModele, leconEffectuee) VALUES ('2026-01-07 08:00:00', 3, 5, 60, 3, 1);
INSERT INTO LECON (dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, idModele, leconEffectuee) VALUES ('2026-01-08 08:00:00', 4, 6, 60, 4, 1);

GO
