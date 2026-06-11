class User {
  constructor({ idUser, email, role, nom, prenom, dateNaissance }) {
    this.idUser = idUser;
    this.email = email;
    this.role = role;
    this.nom = nom;
    this.prenom = prenom;
    this.dateNaissance = dateNaissance;
  }
}

module.exports = User;
