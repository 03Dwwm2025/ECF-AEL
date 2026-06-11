import { api } from '../api/client.js';
import { navigate } from '../router.js';

const pad = (n) => String(n).padStart(4, '0');

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function initials(e) {
  return ((e.prenomEleve?.[0] ?? '') + (e.nomEleve?.[0] ?? '')).toUpperCase();
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function status(label, kind) {
  if (kind === 'pill') return `<span class="status-pill">${label}</span>`;
  return `<span class="status status-${kind}">${label}</span>`;
}

export async function render(container) {
  const crumb = document.querySelector('#breadcrumb .current');
  if (crumb) crumb.textContent = 'Élèves';

  container.innerHTML = `<div class="page-state">Chargement des élèves…</div>`;

  let eleves;
  try {
    eleves = await api.get('/eleves');
  } catch (err) {
    container.innerHTML = `<div class="page-state error">Erreur de chargement : ${escapeHtml(err.message)}</div>`;
    return;
  }

  const total = eleves.length;
  const plural = total > 1 ? 's' : '';

  container.innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">Élèves</h1>
        <p class="page-sub">${total} élève${plural} inscrit${plural} · année en cours</p>
      </div>
      <button class="btn-primary" id="btn-new-eleve"><i class="bi bi-plus-lg"></i> Nouvel élève</button>
    </div>

    <div class="card-panel">
      <div class="toolbar">
        <label class="tool-search">
          <i class="bi bi-search"></i>
          <input type="search" id="search" placeholder="Rechercher un élève…" autocomplete="off" />
        </label>
        <div class="pills" id="pills">
          <button class="pill active" data-filter="tous">Tous</button>
          <button class="pill" data-filter="code">Code obtenu</button>
          <button class="pill" data-filter="permis">Conduite obtenue</button>
          <button class="pill" data-filter="prepa">En préparation</button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Téléphone</th>
              <th>Inscrit le</th>
              <th>Code</th>
              <th>Conduite</th>
              <th class="col-num">Leçons</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
        <div class="table-empty" id="empty" hidden>Aucun élève ne correspond à la recherche.</div>
      </div>
    </div>

    <!-- Modale : nouvel élève -->
    <div class="modal-overlay" id="eleve-modal" hidden>
      <div class="modal-box">
        <div class="modal-head">
          <h3>Nouvel élève</h3>
          <button class="modal-close" id="modal-close" aria-label="Fermer"><i class="bi bi-x-lg"></i></button>
        </div>
        <p class="modal-sub">Inscription d'un nouvel élève · code et conduite à zéro par défaut.</p>

        <form id="form-eleve">
          <div class="form-row">
            <label class="form-field">Prénom
              <input type="text" name="prenomEleve" required autocomplete="off" />
            </label>
            <label class="form-field">Nom
              <input type="text" name="nomEleve" required autocomplete="off" />
            </label>
          </div>

          <div class="form-row">
            <label class="form-field">Date de naissance
              <input type="date" name="dateNaissance" required />
            </label>
            <label class="form-field">Date d'inscription
              <input type="date" name="dateInscription" required />
            </label>
          </div>

          <label class="form-field" style="margin-bottom:1rem">Téléphone <span class="field-opt">(optionnel)</span>
            <input type="tel" name="telephone" placeholder="06 12 34 56 78" autocomplete="off" />
          </label>

          <p class="form-error" id="eleve-error" hidden></p>

          <div class="modal-foot">
            <button type="button" class="btn-outline" id="modal-cancel">Annuler</button>
            <button type="submit" class="btn-primary" id="eleve-submit">Créer l'élève</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#tbody');
  const empty = container.querySelector('#empty');

  const state = { filter: 'tous', search: '' };

  function visible() {
    const q = state.search.trim().toLowerCase();
    return eleves.filter((e) => {
      if (state.filter === 'code'   && !e.code)               return false;
      if (state.filter === 'permis' && !e.conduite)           return false;
      // En préparation = code obtenu mais conduite pas encore validée
      if (state.filter === 'prepa'  && !(e.code && !e.conduite)) return false;
      if (q) {
        const hay = `${e.prenomEleve} ${e.nomEleve} EL-${pad(e.idEleve)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderRows() {
    const list = visible();
    empty.hidden = list.length > 0;
    tbody.innerHTML = list.map((e) => `
      <tr class="row-link" data-id="${e.idEleve}">
        <td>
          <div class="cell-eleve">
            <span class="avatar">${initials(e)}</span>
            <div>
              <div class="cell-name">${escapeHtml(e.prenomEleve)} ${escapeHtml(e.nomEleve)}</div>
              <div class="cell-id">EL-${pad(e.idEleve)}</div>
            </div>
          </div>
        </td>
        <td class="cell-muted">${escapeHtml(e.telephone) || '—'}</td>
        <td class="cell-muted">${formatDate(e.dateInscription)}</td>
        <td>${e.code ? status('Obtenu', 'ok') : status('En cours', 'info')}</td>
        <td>${
          e.conduite ? status('Obtenu', 'ok')
          : e.code   ? status('En préparation', 'info')
          : status('Non commencée', 'pill')
        }</td>
        <td class="col-num cell-num">${e.nbLecon ?? 0}</td>
      </tr>
    `).join('');
  }

  container.querySelector('#search').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderRows();
  });

  container.querySelector('#pills').addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    state.filter = btn.dataset.filter;
    container.querySelectorAll('.pill').forEach((p) => p.classList.toggle('active', p === btn));
    renderRows();
  });

  tbody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (tr) navigate(`/eleves/${tr.dataset.id}`);
  });

  /* ---------- modale nouvel élève ---------- */
  const modal     = container.querySelector('#eleve-modal');
  const form      = container.querySelector('#form-eleve');
  const errorEl   = container.querySelector('#eleve-error');
  const submitBtn = container.querySelector('#eleve-submit');

  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
  const closeModal = () => { modal.hidden = true; };

  function openModal() {
    errorEl.hidden = true;
    form.reset();
    form.dateInscription.value = new Date().toISOString().slice(0, 10); // aujourd'hui par défaut
    modal.hidden = false;
    form.prenomEleve.focus();
  }

  container.querySelector('#btn-new-eleve').addEventListener('click', openModal);
  container.querySelector('#modal-close').addEventListener('click', closeModal);
  container.querySelector('#modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const payload = {
      prenomEleve:     form.prenomEleve.value.trim(),
      nomEleve:        form.nomEleve.value.trim(),
      dateNaissance:   form.dateNaissance.value,
      dateInscription: form.dateInscription.value,
    };
    const tel = form.telephone.value.trim();
    if (tel) payload.telephone = tel; // omis si vide (sinon la validation FR échoue sur "")

    submitBtn.disabled = true;
    submitBtn.textContent = 'Création…';
    try {
      const nouvel = await api.post('/eleves', payload);
      closeModal();
      // on ouvre directement la fiche du nouvel élève
      if (nouvel && nouvel.idEleve) navigate(`/eleves/${nouvel.idEleve}`);
      else render(container);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Créer l'élève";
    }
  });

  renderRows();
}
