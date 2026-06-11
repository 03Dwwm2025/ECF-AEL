class Vehicule {
  constructor({ numImmat, idModele, modeleVehicule, marque, annee, dateAchat, etat }) {
    this.numImmat = numImmat;
    this.idModele = idModele;
    this.modeleVehicule = modeleVehicule;
    this.marque = marque;
    this.annee = annee;
    this.dateAchat = dateAchat;
    this.etat = etat;
  }
}

module.exports = Vehicule;
