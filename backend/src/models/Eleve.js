class Eleve {
  constructor({ idEleve, nomEleve, prenomEleve, telephone, code, conduite, dateNaissance, dateInscription, nbLecon }) {
    this.idEleve = idEleve;
    this.nomEleve = nomEleve;
    this.prenomEleve = prenomEleve;
    this.telephone = telephone;
    this.code = code;
    this.conduite = conduite;
    this.dateNaissance = dateNaissance;
    this.dateInscription = dateInscription;
    this.nbLecon = nbLecon;
  }
}

module.exports = Eleve;