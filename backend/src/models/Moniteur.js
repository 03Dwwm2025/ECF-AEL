const User = require('./User');

class Moniteur extends User {
  constructor({ idMoniteur, dateEmbauche, activite, idUser, nom, prenom, email, dateNaissance }) {
    super({ idUser, email, role: 'moniteur', nom, prenom, dateNaissance });
    this.idMoniteur = idMoniteur;
    this.dateEmbauche = dateEmbauche;
    this.activite = activite;
  }
}

module.exports = Moniteur;