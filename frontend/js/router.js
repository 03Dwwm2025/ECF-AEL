import { isLoggedIn, removeToken } from './utils/auth.js';

// Redirige vers /login tant qu'aucun token n'est présent.
const AUTH_ENABLED = true;

const routes = {
  '/login':      () => import('./pages/login.js'),
  '/eleves':     () => import('./pages/eleves.js'),
  '/moniteurs':  () => import('./pages/moniteurs.js'),
  '/vehicules':  () => import('./pages/vehicules.js'),
  '/modeles':    () => import('./pages/modeles.js'),
  '/lecons':     () => import('./pages/lecons.js'),
  '/calendrier': () => import('./pages/calendrier.js'),
  '/users':      () => import('./pages/users.js'),
};

const nav    = document.getElementById('nav');
const appDiv = document.getElementById('app');

export async function navigate(path) {
  if (AUTH_ENABLED) {
    if (path !== '/login' && !isLoggedIn()) return navigate('/login');
    if (path === '/login' && isLoggedIn())  return navigate('/eleves');
  }

  // Routes statiques + routes dynamiques (ex: /eleves/123 → fiche élève)
  let load = routes[path];
  let params = {};
  const eleveMatch = path.match(/^\/eleves\/(\d+)$/);
  if (!load && eleveMatch) {
    load = () => import('./pages/eleve.js');
    params = { id: eleveMatch[1] };
  }
  if (!load) load = routes['/eleves'];

  const module = await load();

  // En mode login : pleine page, sans sidebar ni en-tête (cf. .auth-view dans le CSS)
  document.body.classList.toggle('auth-view', path === '/login');

  nav.querySelectorAll('a[data-link]').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', path === href || path.startsWith(href + '/'));
  });

  appDiv.innerHTML = '';
  module.render(appDiv, params);

  if (location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[data-link]');
  if (!a) return;
  e.preventDefault();
  navigate(a.getAttribute('href'));
});

document.getElementById('btn-logout').addEventListener('click', () => {
  removeToken();
  navigate('/login');
});

window.addEventListener('popstate', () => navigate(location.pathname));

navigate(location.pathname === '/' ? '/eleves' : location.pathname);
