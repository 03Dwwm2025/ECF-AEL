const { test, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');

// Le module de connexion ouvre une connexion SQL Server dès son chargement :
// on le remplace par un faux avant que les repositories ne le requièrent.
const dbPath = require.resolve('../src/config/db');
require.cache[dbPath] = {
  id: dbPath, filename: dbPath, loaded: true,
  exports: { pool: {}, poolConnect: Promise.resolve(), sql: {} },
};

const leconsRepository     = require('../src/repositories/lecons.repository');
const elevesRepository     = require('../src/repositories/eleves.repository');
const moniteursRepository  = require('../src/repositories/moniteurs.repository');
const calendrierRepository = require('../src/repositories/calendrier.repository');
const leconsService        = require('../src/services/lecons.service');

const CRENEAU = '2026-06-15T10:00:00.000Z';
const demande = { idEleve: 1, idMoniteur: 2, idModele: 3, dateHeure: CRENEAU, duree: 60 };

beforeEach(() => {
  mock.restoreAll();
  mock.method(elevesRepository, 'getById', async () => ({ idEleve: 1 }));
  mock.method(moniteursRepository, 'getById', async () => ({ idMoniteur: 2, activite: true }));
  mock.method(calendrierRepository, 'getAll', async () => [{ dateHeure: new Date(CRENEAU) }]);
  mock.method(leconsRepository, 'getAll', async () => []);
  mock.method(leconsRepository, 'create', async () => {});
});

test('une réservation valide est enregistrée', async () => {
  await leconsService.create(demande);
  assert.equal(leconsRepository.create.mock.callCount(), 1);
  assert.deepEqual(leconsRepository.create.mock.calls[0].arguments[0], demande);
});

test('un moniteur déjà pris sur le créneau provoque un conflit 409', async () => {
  leconsRepository.getAll.mock.mockImplementation(async () => [
    { idEleve: 9, idMoniteur: 2, dateHeure: new Date(CRENEAU) },
  ]);
  await assert.rejects(leconsService.create(demande), { status: 409 });
  assert.equal(leconsRepository.create.mock.callCount(), 0);
});

test('un élève introuvable renvoie 404 sans rien enregistrer', async () => {
  elevesRepository.getById.mock.mockImplementation(async () => null);
  await assert.rejects(leconsService.create(demande), { status: 404 });
  assert.equal(leconsRepository.create.mock.callCount(), 0);
});

test('un créneau absent du calendrier renvoie 400', async () => {
  calendrierRepository.getAll.mock.mockImplementation(async () => []);
  await assert.rejects(leconsService.create(demande), { status: 400 });
  assert.equal(leconsRepository.create.mock.callCount(), 0);
});
