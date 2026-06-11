class Lecon {
  constructor({ idModele, modeleVehicule, dateHeureLecon, idEleveLecon, idMoniteurLecon, duree, leconEffectuee }) {
    this.idModele = idModele;
    this.modeleVehicule = modeleVehicule;
    this.dateHeure = dateHeureLecon;
    this.idEleve = idEleveLecon;
    this.idMoniteur = idMoniteurLecon;
    this.duree = duree;
    this.leconEffectuee = leconEffectuee;
  }
}

module.exports = Lecon;
