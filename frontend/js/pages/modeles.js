import { api } from '../api/client.js';

/* ---------- helpers ---------- */
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---------- page ---------- */
export async function render(container) {
  const crumb = document.querySelector('#breadcrumb .current');
  if (crumb) crumb.textContent = 'Modèles';

  container.innerHTML = `<div class="page-state">Chargement des modèles…</div>`;

  let modeles, vehicules;
  try {
    [modeles, vehicules] = await Promise.all([api.get('/modeles'), api.get('/vehicules')]);
  } catch (err) {
    container.innerHTML = `<div class="page-state error">Erreur de chargement : ${escapeHtml(err.message)}</div>`;
    return;
  }

  // nombre de véhicules par modèle
  const countByModele = {};
  for (const v of vehicules) countByModele[v.idModele] = (countByModele[v.idModele] || 0) + 1;

  const total = modeles.length;
  const plural = total > 1 ? 's' : '';

  container.innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">Modèles</h1>
        <p class="page-sub">${total} modèle${plural} de véhicule au catalogue</p>
      </div>
      <button class="btn-primary" id="btn-new"><i class="bi bi-plus-lg"></i> Nouveau modèle</button>
    </div>

    <div class="card-panel">
      <div class="toolbar">
        <label class="tool-search">
          <i class="bi bi-search"></i>
          <input type="search" id="search" placeholder="Rechercher (marque, modèle)…" autocomplete="off" />
        </label>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Marque</th><th>Modèle</th><th class="col-num">Véhicules</th><th class="col-actions">Actions</th></tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
        <div class="table-empty" id="empty" hidden>Aucun modèle ne correspond.</div>
      </div>
    </div>

    <!-- Modale : création / édition -->
    <div class="modal-overlay" id="modal" hidden>
      <div class="modal-box">
        <div class="modal-head">
          <h3 id="modal-title">Nouveau modèle</h3>
          <button class="modal-close" id="modal-close" aria-label="Fermer"><i class="bi bi-x-lg"></i></button>
        </div>
        <p class="modal-sub">Catalogue des modèles utilisés par les véhicules et les leçons.</p>

        <form id="form">
          <div class="form-row">
            <label class="form-field">Marque
              <input type="text" name="marque" required autocomplete="off" placeholder="Renault" />
            </label>
            <label class="form-field">Modèle
              <input type="text" name="modeleVehicule" required autocomplete="off" placeholder="Clio" />
            </label>
          </div>

          <p class="form-error" id="error" hidden></p>

          <div class="modal-foot">
            <button type="button" class="btn-outline" id="modal-cancel">Annuler</button>
            <button type="submit" class="btn-primary" id="submit">Créer le modèle</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#tbody');
  const empty = container.querySelector('#empty');
  const state = { search: '' };

  function visible() {
    const q = state.search.trim().toLowerCase();
    if (!q) return modeles;
    return modeles.filter((m) => `${m.marque} ${m.modeleVehicule}`.toLowerCase().includes(q));
  }

  function renderRows() {
    const list = visible();
    empty.hidden = list.length > 0;
    tbody.innerHTML = list.map((m) => `
      <tr>
        <td class="cell-name">${escapeHtml(m.marque)}</td>
        <td class="cell-muted">${escapeHtml((m.modeleVehicule || '').trim())}</td>
        <td class="col-num cell-num">${countByModele[m.idModele] || 0}</td>
        <td class="col-actions">
          <div class="row-actions">
            <button class="icon-btn" data-action="edit" data-id="${m.idModele}" title="Modifier"><i class="bi bi-pencil"></i></button>
            <button class="icon-btn danger" data-action="delete" data-id="${m.idModele}" title="Supprimer"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  container.querySelector('#search').addEventListener('input', (e) => { state.search = e.target.value; renderRows(); });

  /* ---------- modale (création + édition) ---------- */
  const modal     = container.querySelector('#modal');
  const form      = container.querySelector('#form');
  const errorEl   = container.querySelector('#error');
  const submitBtn = container.querySelector('#submit');
  const titleEl   = container.querySelector('#modal-title');

  let editingId = null;

  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
  const closeModal = () => { modal.hidden = true; };

  function openCreate() {
    editingId = null;
    errorEl.hidden = true;
    form.reset();
    titleEl.textContent = 'Nouveau modèle';
    submitBtn.textContent = 'Créer le modèle';
    modal.hidden = false;
    form.marque.focus();
  }

  function openEdit(m) {
    editingId = m.idModele;
    errorEl.hidden = true;
    form.reset();
    form.marque.value = m.marque;
    form.modeleVehicule.value = (m.modeleVehicule || '').trim();
    titleEl.textContent = 'Modifier le modèle';
    submitBtn.textContent = 'Enregistrer';
    modal.hidden = false;
    form.marque.focus();
  }

  container.querySelector('#btn-new').addEventListener('click', openCreate);
  container.querySelector('#modal-close').addEventListener('click', closeModal);
  container.querySelector('#modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const m = modeles.find((x) => x.idModele === Number(btn.dataset.id));
    if (!m) return;

    if (btn.dataset.action === 'edit') {
      openEdit(m);
      return;
    }
    if (btn.dataset.action === 'delete') {
      if (!confirm(`Supprimer le modèle ${m.marque} ${m.modeleVehicule} ?`)) return;
      btn.disabled = true;
      try {
        await api.delete(`/modeles/${m.idModele}`);
        render(container);
      } catch (err) {
        btn.disabled = false;
        alert('Suppression impossible : ' + err.message);
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const payload = {
      marque:         form.marque.value.trim(),
      modeleVehicule: form.modeleVehicule.value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = editingId ? 'Enregistrement…' : 'Création…';
    try {
      if (editingId) await api.put(`/modeles/${editingId}`, payload);
      else           await api.post('/modeles', payload);
      closeModal();
      render(container);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? 'Enregistrer' : 'Créer le modèle';
    }
  });

  renderRows();
}
