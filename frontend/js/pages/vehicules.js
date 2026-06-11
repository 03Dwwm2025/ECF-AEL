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
  if (crumb) crumb.textContent = 'Véhicules';

  container.innerHTML = `<div class="page-state">Chargement des véhicules…</div>`;

  let vehicules, modeles;
  try {
    [vehicules, modeles] = await Promise.all([api.get('/vehicules'), api.get('/modeles')]);
  } catch (err) {
    container.innerHTML = `<div class="page-state error">Erreur de chargement : ${escapeHtml(err.message)}</div>`;
    return;
  }

  const total = vehicules.length;
  const plural = total > 1 ? 's' : '';
  const enService = vehicules.filter((v) => v.etat).length;
  const modeleLabel = (m) => (m.marque ? m.marque + ' ' : '') + (m.modeleVehicule || '').trim();

  container.innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">Véhicules</h1>
        <p class="page-sub">${total} véhicule${plural} · ${enService} en service</p>
      </div>
      <button class="btn-primary" id="btn-new"><i class="bi bi-plus-lg"></i> Nouveau véhicule</button>
    </div>

    <div class="card-panel">
      <div class="toolbar">
        <label class="tool-search">
          <i class="bi bi-search"></i>
          <input type="search" id="search" placeholder="Rechercher (immatriculation, modèle)…" autocomplete="off" />
        </label>
        <div class="pills" id="pills">
          <button class="pill active" data-filter="tous">Tous</button>
          <button class="pill" data-filter="service">En service</button>
          <button class="pill" data-filter="hors">Hors service</button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Immatriculation</th><th>Modèle</th><th>Année</th><th>État</th><th class="col-actions">Actions</th></tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
        <div class="table-empty" id="empty" hidden>Aucun véhicule ne correspond.</div>
      </div>
    </div>

    <!-- Modale : création / édition -->
    <div class="modal-overlay" id="modal" hidden>
      <div class="modal-box">
        <div class="modal-head">
          <h3 id="modal-title">Nouveau véhicule</h3>
          <button class="modal-close" id="modal-close" aria-label="Fermer"><i class="bi bi-x-lg"></i></button>
        </div>
        <p class="modal-sub" id="modal-sub">Rattaché à un modèle existant.</p>

        <form id="form">
          <div class="form-row">
            <label class="form-field">Immatriculation <span class="field-opt">(9 car. max)</span>
              <input type="text" name="numImmat" required maxlength="9" placeholder="AB-123-CD" autocomplete="off" />
            </label>
            <label class="form-field">Modèle
              <select name="idModele" required>
                ${modeles.map((m) => `<option value="${m.idModele}">${escapeHtml(modeleLabel(m))}</option>`).join('')
                  || '<option value="">Aucun modèle</option>'}
              </select>
            </label>
          </div>
          <div class="form-row">
            <label class="form-field">Année
              <input type="number" name="annee" required min="1900" max="2100" placeholder="2022" />
            </label>
            <label class="form-field">Date d'achat
              <input type="date" name="dateAchat" required />
            </label>
          </div>
          <div class="form-checks">
            <label class="form-check"><input type="checkbox" name="etat" checked /> En service</label>
          </div>

          <p class="form-error" id="error" hidden></p>

          <div class="modal-foot">
            <button type="button" class="btn-outline" id="modal-cancel">Annuler</button>
            <button type="submit" class="btn-primary" id="submit">Créer le véhicule</button>
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
    return vehicules.filter((v) => {
      if (state.filter === 'service' && !v.etat) return false;
      if (state.filter === 'hors'    &&  v.etat) return false;
      if (q) {
        const hay = `${v.numImmat} ${v.modeleVehicule}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderRows() {
    const list = visible();
    empty.hidden = list.length > 0;
    tbody.innerHTML = list.map((v) => `
      <tr>
        <td class="cell-name" style="font-family:ui-monospace,monospace">${escapeHtml(v.numImmat)}</td>
        <td class="cell-muted">${escapeHtml((v.marque ? v.marque + ' ' : '') + (v.modeleVehicule || '').trim())}</td>
        <td class="cell-muted">${v.annee ?? '—'}</td>
        <td>${v.etat
          ? `<span class="status status-ok">En service</span>`
          : `<span class="status-pill">Hors service</span>`}</td>
        <td class="col-actions">
          <div class="row-actions">
            <button class="icon-btn" data-action="edit" data-immat="${escapeHtml(v.numImmat)}" title="Modifier"><i class="bi bi-pencil"></i></button>
            <button class="icon-btn danger" data-action="delete" data-immat="${escapeHtml(v.numImmat)}" title="Supprimer"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  container.querySelector('#search').addEventListener('input', (e) => { state.search = e.target.value; renderRows(); });
  container.querySelector('#pills').addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    state.filter = btn.dataset.filter;
    container.querySelectorAll('.pill').forEach((p) => p.classList.toggle('active', p === btn));
    renderRows();
  });

  /* ---------- modale (création + édition) ---------- */
  const modal      = container.querySelector('#modal');
  const form       = container.querySelector('#form');
  const errorEl    = container.querySelector('#error');
  const submitBtn  = container.querySelector('#submit');
  const titleEl    = container.querySelector('#modal-title');
  const immatInput = form.numImmat;

  let editingImmat = null;

  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
  const closeModal = () => { modal.hidden = true; };

  function openCreate() {
    editingImmat = null;
    errorEl.hidden = true;
    form.reset();
    immatInput.readOnly = false;
    form.annee.value = new Date().getFullYear();
    form.dateAchat.value = new Date().toISOString().slice(0, 10);
    titleEl.textContent = 'Nouveau véhicule';
    submitBtn.textContent = 'Créer le véhicule';
    modal.hidden = false;
    immatInput.focus();
  }

  function openEdit(v) {
    editingImmat = v.numImmat;
    errorEl.hidden = true;
    form.reset();
    immatInput.value = v.numImmat;
    immatInput.readOnly = true;       // l'immatriculation est l'identifiant, non modifiable
    form.idModele.value = String(v.idModele);
    form.annee.value = v.annee;
    form.dateAchat.value = (v.dateAchat || '').slice(0, 10);
    form.etat.checked = !!v.etat;
    titleEl.textContent = 'Modifier le véhicule';
    submitBtn.textContent = 'Enregistrer';
    modal.hidden = false;
  }

  container.querySelector('#btn-new').addEventListener('click', openCreate);
  container.querySelector('#modal-close').addEventListener('click', closeModal);
  container.querySelector('#modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Actions sur les lignes : modifier / supprimer
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const v = vehicules.find((x) => x.numImmat === btn.dataset.immat);
    if (!v) return;

    if (btn.dataset.action === 'edit') {
      openEdit(v);
      return;
    }
    if (btn.dataset.action === 'delete') {
      if (!confirm(`Supprimer le véhicule ${v.numImmat} ?`)) return;
      btn.disabled = true;
      try {
        await api.delete(`/vehicules/${encodeURIComponent(v.numImmat)}`);
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

    const etat = form.etat.checked;
    const idModele = Number(form.idModele.value);
    const annee = Number(form.annee.value);
    const dateAchat = form.dateAchat.value;

    submitBtn.disabled = true;
    submitBtn.textContent = editingImmat ? 'Enregistrement…' : 'Création…';
    try {
      if (editingImmat) {
        await api.put(`/vehicules/${encodeURIComponent(editingImmat)}`, { idModele, annee, dateAchat, etat });
      } else {
        await api.post('/vehicules', { numImmat: form.numImmat.value.trim(), idModele, annee, dateAchat, etat });
      }
      closeModal();
      render(container);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = editingImmat ? 'Enregistrer' : 'Créer le véhicule';
    }
  });

  renderRows();
}
