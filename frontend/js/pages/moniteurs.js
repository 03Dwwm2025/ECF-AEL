import { api } from '../api/client.js';

/* ---------- helpers ---------- */
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
const initials = (m) => ((m.prenom?.[0] ?? '') + (m.nom?.[0] ?? '')).toUpperCase();
function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date) ? '—' : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ---------- page ---------- */
export async function render(container) {
  const crumb = document.querySelector('#breadcrumb .current');
  if (crumb) crumb.textContent = 'Moniteurs';

  container.innerHTML = `<div class="page-state">Chargement des moniteurs…</div>`;

  let moniteurs;
  try {
    moniteurs = await api.get('/moniteurs');
  } catch (err) {
    container.innerHTML = `<div class="page-state error">Erreur de chargement : ${escapeHtml(err.message)}</div>`;
    return;
  }

  const total = moniteurs.length;
  const plural = total > 1 ? 's' : '';
  const actifs = moniteurs.filter((m) => m.activite).length;

  container.innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">Moniteurs</h1>
        <p class="page-sub">${total} moniteur${plural} · ${actifs} actif${actifs > 1 ? 's' : ''}</p>
      </div>
      <button class="btn-primary" id="btn-new"><i class="bi bi-plus-lg"></i> Nouveau moniteur</button>
    </div>

    <div class="card-panel">
      <div class="toolbar">
        <label class="tool-search">
          <i class="bi bi-search"></i>
          <input type="search" id="search" placeholder="Rechercher un moniteur…" autocomplete="off" />
        </label>
        <div class="pills" id="pills">
          <button class="pill active" data-filter="tous">Tous</button>
          <button class="pill" data-filter="actifs">Actifs</button>
          <button class="pill" data-filter="inactifs">Inactifs</button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Moniteur</th><th>Email</th><th>Embauché le</th><th>Statut</th><th class="col-actions">Actions</th></tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
        <div class="table-empty" id="empty" hidden>Aucun moniteur ne correspond.</div>
      </div>
    </div>

    <!-- Modale : création / édition -->
    <div class="modal-overlay" id="modal" hidden>
      <div class="modal-box">
        <div class="modal-head">
          <h3 id="modal-title">Nouveau moniteur</h3>
          <button class="modal-close" id="modal-close" aria-label="Fermer"><i class="bi bi-x-lg"></i></button>
        </div>
        <p class="modal-sub" id="modal-sub">Un compte de connexion (rôle moniteur) est créé automatiquement.</p>

        <form id="form">
          <div class="form-row">
            <label class="form-field">Prénom
              <input type="text" name="prenom" required autocomplete="off" />
            </label>
            <label class="form-field">Nom
              <input type="text" name="nom" required autocomplete="off" />
            </label>
          </div>

          <label class="form-field" style="margin-bottom:1rem">Email
            <input type="email" name="email" required autocomplete="off" />
          </label>

          <label class="form-field" id="pwd-field" style="margin-bottom:1rem">Mot de passe <span class="field-opt">(6 car. min)</span>
            <input type="password" name="mdp" minlength="6" autocomplete="new-password" />
          </label>

          <div class="form-row">
            <label class="form-field">Date de naissance
              <input type="date" name="dateNaissance" required />
            </label>
            <label class="form-field">Date d'embauche
              <input type="date" name="dateEmbauche" required />
            </label>
          </div>
          <div class="form-checks">
            <label class="form-check"><input type="checkbox" name="activite" checked /> Moniteur actif</label>
          </div>

          <p class="form-error" id="error" hidden></p>

          <div class="modal-foot">
            <button type="button" class="btn-outline" id="modal-cancel">Annuler</button>
            <button type="submit" class="btn-primary" id="submit">Créer le moniteur</button>
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
    return moniteurs.filter((m) => {
      if (state.filter === 'actifs'   && !m.activite) return false;
      if (state.filter === 'inactifs' &&  m.activite) return false;
      if (q) {
        const hay = `${m.prenom} ${m.nom} ${m.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderRows() {
    const list = visible();
    empty.hidden = list.length > 0;
    tbody.innerHTML = list.map((m) => `
      <tr>
        <td>
          <div class="cell-eleve">
            <span class="avatar">${initials(m)}</span>
            <div>
              <div class="cell-name">${escapeHtml(m.prenom)} ${escapeHtml(m.nom)}</div>
              <div class="cell-id">MON-${String(m.idMoniteur).padStart(3, '0')}</div>
            </div>
          </div>
        </td>
        <td class="cell-muted">${escapeHtml(m.email)}</td>
        <td class="cell-muted">${formatDate(m.dateEmbauche)}</td>
        <td>${m.activite
          ? `<span class="status status-ok">Actif</span>`
          : `<span class="status-pill">Inactif</span>`}</td>
        <td class="col-actions">
          <div class="row-actions">
            <button class="icon-btn" data-action="edit" data-id="${m.idMoniteur}" title="Modifier"><i class="bi bi-pencil"></i></button>
            <button class="icon-btn danger" data-action="delete" data-id="${m.idMoniteur}" title="Supprimer"><i class="bi bi-trash"></i></button>
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
  const modal     = container.querySelector('#modal');
  const form      = container.querySelector('#form');
  const errorEl   = container.querySelector('#error');
  const submitBtn = container.querySelector('#submit');
  const titleEl   = container.querySelector('#modal-title');
  const subEl     = container.querySelector('#modal-sub');
  const pwdField  = container.querySelector('#pwd-field');
  const mdpInput  = form.mdp;

  let editingId = null;

  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
  const closeModal = () => { modal.hidden = true; };

  function openCreate() {
    editingId = null;
    errorEl.hidden = true;
    form.reset();
    form.dateEmbauche.value = new Date().toISOString().slice(0, 10);
    titleEl.textContent = 'Nouveau moniteur';
    subEl.hidden = false;
    pwdField.hidden = false;
    mdpInput.required = true;
    submitBtn.textContent = 'Créer le moniteur';
    modal.hidden = false;
    form.prenom.focus();
  }

  function openEdit(m) {
    editingId = m.idMoniteur;
    errorEl.hidden = true;
    form.reset();
    form.prenom.value = m.prenom;
    form.nom.value = m.nom;
    form.email.value = m.email;
    form.dateNaissance.value = (m.dateNaissance || '').slice(0, 10);
    form.dateEmbauche.value = (m.dateEmbauche || '').slice(0, 10);
    form.activite.checked = !!m.activite;
    titleEl.textContent = 'Modifier le moniteur';
    subEl.hidden = true;
    pwdField.hidden = true;          // le mot de passe ne se modifie pas ici
    mdpInput.required = false;
    submitBtn.textContent = 'Enregistrer';
    modal.hidden = false;
    form.prenom.focus();
  }

  container.querySelector('#btn-new').addEventListener('click', openCreate);
  container.querySelector('#modal-close').addEventListener('click', closeModal);
  container.querySelector('#modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Actions sur les lignes : modifier / supprimer
  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const m = moniteurs.find((x) => x.idMoniteur === Number(btn.dataset.id));
    if (!m) return;

    if (btn.dataset.action === 'edit') {
      openEdit(m);
      return;
    }
    if (btn.dataset.action === 'delete') {
      if (!confirm(`Supprimer le moniteur ${m.prenom} ${m.nom} ? Son compte de connexion sera aussi supprimé.`)) return;
      btn.disabled = true;
      try {
        await api.delete(`/moniteurs/${m.idMoniteur}`);
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
      prenom:        form.prenom.value.trim(),
      nom:           form.nom.value.trim(),
      email:         form.email.value.trim(),
      dateNaissance: form.dateNaissance.value,
      dateEmbauche:  form.dateEmbauche.value,
      activite:      form.activite.checked,
    };
    if (!editingId) payload.mdp = form.mdp.value; // mot de passe seulement à la création

    submitBtn.disabled = true;
    submitBtn.textContent = editingId ? 'Enregistrement…' : 'Création…';
    try {
      if (editingId) await api.put(`/moniteurs/${editingId}`, payload);
      else           await api.post('/moniteurs', payload);
      closeModal();
      render(container);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? 'Enregistrer' : 'Créer le moniteur';
    }
  });

  renderRows();
}
