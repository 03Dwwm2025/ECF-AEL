require('dotenv').config();
require('./src/config/db');
const express = require('express');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('./src/middlewares/auth.middleware');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', require('./src/routes/auth.routes'));

// Fallback SPA : toute requête GET non-API (et non servie en statique) renvoie
// index.html. Placé AVANT authMiddleware pour que les deep-links / rafraîchissements
// sur /login, /eleves, etc. ne soient pas bloqués par l'auth.
app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

app.use(authMiddleware);
app.use('/api/users',      require('./src/routes/users.routes'));
app.use('/api/eleves',     require('./src/routes/eleves.routes'));
app.use('/api/moniteurs',  require('./src/routes/moniteurs.routes'));
app.use('/api/vehicules',  require('./src/routes/vehicules.routes'));
app.use('/api/modeles',    require('./src/routes/modeles.routes'));
app.use('/api/lecons',     require('./src/routes/lecons.routes'));
app.use('/api/calendrier', require('./src/routes/calendrier.routes'));

app.use(errorMiddleware);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
