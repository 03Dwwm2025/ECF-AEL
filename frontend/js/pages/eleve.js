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

function formatDateTime(d) {
  const date = new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' · ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuree(min) {
  if (min == null) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export async function render(container, { id } = {}) {
  container.innerHTML = `<div class="page-state">Chargement de la fiche…</div>`;

  let eleve;
  try {
    eleve = await api.get(`/eleves/${id}`);
  } catch (err) {
    container.innerHTML = `
      <a class="detail-back" href="/eleves" data-link><i class="bi bi-chevron-left"></i> Retour à la liste</a>
      <div class="page-state error">Élève introuvable : ${escapeHtml(err.message)}</div>`;
    return;
  }

  const crumbRoot = document.querySelector('#breadcrumb span:first-child');
  const crumbCur  = document.querySelector('#breadcrumb .current');
  if (crumbRoot) crumbRoot.textContent = 'Élèves';
  if (crumbCur)  crumbCur.textContent = `${eleve.prenomEleve} ${eleve.nomEleve}`;

  const [lecons, moniteurs] = await Promise.all([
    api.get(`/lecons/eleve/${id}`).catch(() => []),
    api.get('/moniteurs').catch(() => []),
  ]);

  const moniteurName = Object.fromEntries(
    moniteurs.map((m) => [m.idMoniteur, `${m.prenom} ${m.nom}`])
  );

  // Seules les leçons validées (effectuées) comptent dans les heures cumulées.
  const totalMin = lecons.filter((l) => l.leconEffectuee).reduce((s, l) => s + (l.duree || 0), 0);
  const pending  = lecons.filter((l) => !l.leconEffectuee).length;

  let badge;
  if (eleve.conduite)   badge = { label: 'Permis obtenu', kind: 'ok' };
  else if (eleve.code)  badge = { label: 'En conduite',   kind: 'info' };
  else                  badge = { label: 'Code en cours', kind: 'warn' };

  container.innerHTML = `
    <a class="detail-back" href="/eleves" data-link><i class="bi bi-chevron-left"></i> Retour à la liste</a>

    <div class="card-panel detail-head">
      <span class="avatar avatar-lg">${initials(eleve)}</span>
      <div class="detail-id">
        <div class="detail-name-row">
          <h1 class="page-title">${escapeHtml(eleve.prenomEleve)} ${escapeHtml(eleve.nomEleve)}</h1>
          <span class="id-badge">EL-${pad(eleve.idEleve)}</span>
          <span class="status status-${badge.kind}">${badge.label}</span>
        </div>
        <div class="detail-meta">
          <span><i class="bi bi-telephone"></i> ${escapeHtml(eleve.telephone) || '—'}</span>
          <span><i class="bi bi-cake2"></i> Né(e) le ${formatDate(eleve.dateNaissance)}</span>
          <span><i class="bi bi-calendar-check"></i> Inscrit le ${formatDate(eleve.dateInscription)}</span>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn-outline" id="btn-edit"><i class="bi bi-pencil"></i> Modifier</button>
        <button class="btn-outline danger" id="btn-delete"><i class="bi bi-trash"></i> Supprimer</button>
      </div>
    </div>

    <div class="detail-cards">
      <div class="card-panel stat-card">
        <div class="stat-card-head"><i class="bi bi-card-checklist"></i> Épreuve du Code</div>
        ${eleve.code
          ? `<span class="status status-ok stat-value">Obtenu</span>`
          : `<span class="status status-info stat-value">En cours</span>`}
      </div>

      <div class="card-panel stat-card">
        <div class="stat-card-head"><i class="bi bi-car-front"></i> Conduite </div>
        ${eleve.conduite
          ? `<span class="status status-ok stat-value">Obtenu</span>`
          : eleve.code
            ? `<span class="status status-info stat-value">En préparation</span>`
            : `<span class="status-pill stat-value">Non commencée</span>`}
      </div>

      <div class="card-panel stat-card">
        <div class="stat-card-head"><i class="bi bi-journal-check"></i> Leçons suivies</div>
        <div class="stat-big">${eleve.nbLecon ?? 0}<small>${formatDuree(totalMin)} cumulées</small></div>
      </div>
    </div>

    <div class="card-panel">
      <div class="panel-title">
        <span>Historique des leçons <span class="muted">· ${lecons.length}${pending ? ` · ${pending} à valider` : ''}</span></span>
        <button class="btn-primary" id="btn-new-lecon"><i class="bi bi-plus-lg"></i> Nouvelle leçon</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Date</th><th>Véhicule</th><th>Moniteur</th><th class="col-num">Durée</th><th>Statut</th></tr>
          </thead>
          <tbody id="hist"></tbody>
        </table>
        <div class="table-empty" id="hist-empty" hidden>Aucune leçon enregistrée.</div>
      </div>
    </div>

    <!-- Modale : nouvelle leçon -->
    <div class="modal-overlay" id="lecon-modal" hidden>
      <div class="modal-box">
        <div class="modal-head">
          <h3>Nouvelle leçon</h3>
          <button class="modal-close" id="modal-close" aria-label="Fermer"><i class="bi bi-x-lg"></i></button>
        </div>
        <p class="modal-sub">Pour ${escapeHtml(eleve.prenomEleve)} ${escapeHtml(eleve.nomEleve)} · EL-${pad(eleve.idEleve)}</p>

        <form id="form-lecon">
          <div class="form-row">
            <label class="form-field">Moniteur
              <select name="idMoniteur" required>
                ${moniteurs.filter((m) => m.activite).map((m) =>
                  `<option value="${m.idMoniteur}">${escapeHtml(m.prenom + ' ' + m.nom)}</option>`).join('')
                  || '<option value="">Aucun moniteur actif</option>'}
              </select>
            </label>
            <label class="form-field">Véhicule
              <select name="idModele" id="sel-modele" required>
                <option value="">Chargement…</option>
              </select>
            </label>
          </div>

          <div class="form-row">
            <label class="form-field">Jour
              <input type="date" id="lecon-date" required />
            </label>
            <label class="form-field">Durée
              <select name="duree" required>
                <option value="60">1h00</option>
                <option value="90" selected>1h30</option>
                <option value="120">2h00</option>
              </select>
            </label>
          </div>

          <div class="form-field slot-field">
            <span>Créneau horaire</span>
            <div class="slot-chips" id="slot-chips"><span class="slot-empty">Choisis d'abord un jour.</span></div>
          </div>

          <p class="form-error" id="lecon-error" hidden></p>

          <div class="modal-foot">
            <button type="button" class="btn-outline" id="modal-cancel">Annuler</button>
            <button type="submit" class="btn-primary" id="lecon-submit">Créer la leçon</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modale : modifier l'élève -->
    <div class="modal-overlay" id="edit-modal" hidden>
      <div class="modal-box">
        <div class="modal-head">
          <h3>Modifier l'élève</h3>
          <button class="modal-close" id="edit-close" aria-label="Fermer"><i class="bi bi-x-lg"></i></button>
        </div>
        <p class="modal-sub">EL-${pad(eleve.idEleve)}</p>

        <form id="form-edit">
          <div class="form-row">
            <label class="form-field">Prénom
              <input type="text" name="prenomEleve" required value="${escapeHtml(eleve.prenomEleve)}" />
            </label>
            <label class="form-field">Nom
              <input type="text" name="nomEleve" required value="${escapeHtml(eleve.nomEleve)}" />
            </label>
          </div>

          <div class="form-row">
            <label class="form-field">Date de naissance
              <input type="date" name="dateNaissance" required value="${(eleve.dateNaissance || '').slice(0, 10)}" />
            </label>
            <label class="form-field">Date d'inscription
              <input type="date" name="dateInscription" required value="${(eleve.dateInscription || '').slice(0, 10)}" />
            </label>
          </div>

          <label class="form-field" style="margin-bottom:1rem">Téléphone <span class="field-opt">(optionnel)</span>
            <input type="tel" name="telephone" placeholder="06 12 34 56 78" value="${escapeHtml(eleve.telephone) || ''}" />
          </label>

          <div class="form-checks">
            <label class="form-check"><input type="checkbox" name="code" ${eleve.code ? 'checked' : ''} /> Code obtenu</label>
            <label class="form-check"><input type="checkbox" name="conduite" ${eleve.conduite ? 'checked' : ''} ${eleve.code ? '' : 'disabled'} /> Conduite / Permis obtenu</label>
          </div>

          <p class="form-error" id="edit-error" hidden></p>

          <div class="modal-foot">
            <button type="button" class="btn-outline" id="edit-cancel">Annuler</button>
            <button type="submit" class="btn-primary" id="edit-submit">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const hist = container.querySelector('#hist');
  const histEmpty = container.querySelector('#hist-empty');

  const ordered = [...lecons].sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure));
  histEmpty.hidden = ordered.length > 0;
  hist.innerHTML = ordered.map((l) => `
    <tr${l.leconEffectuee ? '' : ' class="row-pending"'}>
      <td class="cell-name">${formatDateTime(l.dateHeure)}</td>
      <td class="cell-muted">${escapeHtml(l.modeleVehicule?.trim())}</td>
      <td class="cell-muted">${escapeHtml(moniteurName[l.idMoniteur] ?? ('Moniteur #' + l.idMoniteur))}</td>
      <td class="col-num cell-num">${formatDuree(l.duree)}</td>
      <td>${l.leconEffectuee
        ? `<span class="status status-ok"><i class="bi bi-check-circle"></i> Effectuée</span>`
        : `<button class="btn-validate" data-modele="${l.idModele}" data-date="${l.dateHeure}" data-eleve="${l.idEleve}" data-moniteur="${l.idMoniteur}"><i class="bi bi-check2"></i> Valider</button>`}
      </td>
    </tr>
  `).join('');

  // Valider une leçon → +1 au compteur de l'élève, puis recharge la fiche
  hist.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-validate');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = '…';
    try {
      await api.put('/lecons/valider', {
        idModele:   Number(btn.dataset.modele),
        dateHeure:  btn.dataset.date,
        idEleve:    Number(btn.dataset.eleve),
        idMoniteur: Number(btn.dataset.moniteur),
      });
      render(container, { id });
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check2"></i> Valider';
      alert('Validation impossible : ' + err.message);
    }
  });

  /* ---------- suppression de l'élève ---------- */
  container.querySelector('#btn-delete').addEventListener('click', async (e) => {
    if (!confirm(`Supprimer définitivement l'élève ${eleve.prenomEleve} ${eleve.nomEleve} ?`)) return;
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await api.delete(`/eleves/${id}`);
      navigate('/eleves');
    } catch (err) {
      btn.disabled = false;
      // ex. 409 : "Impossible de supprimer : cet élève a des leçons enregistrées"
      alert('Suppression impossible : ' + err.message);
    }
  });

  /* ---------- modale modifier l'élève ---------- */
  const editModal  = container.querySelector('#edit-modal');
  const editForm   = container.querySelector('#form-edit');
  const editError  = container.querySelector('#edit-error');
  const editSubmit = container.querySelector('#edit-submit');
  const codeChk    = editForm.code;
  const conduiteChk = editForm.conduite;

  const showEditError = (m) => { editError.textContent = m; editError.hidden = false; };
  const closeEdit = () => { editModal.hidden = true; };

  // La conduite ne peut être validée que si le code est obtenu.
  codeChk.addEventListener('change', () => {
    if (!codeChk.checked) { conduiteChk.checked = false; conduiteChk.disabled = true; }
    else conduiteChk.disabled = false;
  });

  container.querySelector('#btn-edit').addEventListener('click', () => { editError.hidden = true; editModal.hidden = false; });
  container.querySelector('#edit-close').addEventListener('click', closeEdit);
  container.querySelector('#edit-cancel').addEventListener('click', closeEdit);
  editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEdit(); });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    editError.hidden = true;

    const tel = editForm.telephone.value.trim();
    const payload = {
      prenomEleve:     editForm.prenomEleve.value.trim(),
      nomEleve:        editForm.nomEleve.value.trim(),
      dateNaissance:   editForm.dateNaissance.value,
      dateInscription: editForm.dateInscription.value,
      telephone:       tel || null,           // null vide le champ
      code:            codeChk.checked,
      conduite:        conduiteChk.checked,
    };

    editSubmit.disabled = true;
    editSubmit.textContent = 'Enregistrement…';
    try {
      await api.put(`/eleves/${id}`, payload);
      closeEdit();
      render(container, { id });
    } catch (err) {
      showEditError(err.message);
      editSubmit.disabled = false;
      editSubmit.textContent = 'Enregistrer';
    }
  });

  /* ---------- modale nouvelle leçon ---------- */
  const modal     = container.querySelector('#lecon-modal');
  const form      = container.querySelector('#form-lecon');
  const selModele = container.querySelector('#sel-modele');
  const dateInput = container.querySelector('#lecon-date');
  const chips     = container.querySelector('#slot-chips');
  const errorEl   = container.querySelector('#lecon-error');
  const submitBtn = container.querySelector('#lecon-submit');

  let slotsByDay = {};  // 'YYYY-MM-DD' -> [iso, ...] (créneaux libres et à venir)
  let selectedIso = '';

  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
  const closeModal = () => { modal.hidden = true; };

  // L'heure stockée est en UTC (08:00Z…) → on l'affiche telle quelle (heure d'agence)
  const slotLabel = (iso) => `${String(new Date(iso).getUTCHours()).padStart(2, '0')}:00`;

  function renderSlots() {
    selectedIso = '';
    const day = dateInput.value;
    const slots = slotsByDay[day] || [];
    chips.innerHTML = slots.length
      ? slots.map((iso) => `<button type="button" class="slot-chip" data-iso="${iso}">${slotLabel(iso)}</button>`).join('')
      : '<span class="slot-empty">Aucun créneau libre ce jour-là.</span>';
  }

  async function openModal() {
    errorEl.hidden = true;
    form.reset();
    selectedIso = '';
    chips.innerHTML = '<span class="slot-empty">Choisis d\'abord un jour.</span>';
    selModele.innerHTML = '<option value="">Chargement…</option>';
    modal.hidden = false;

    try {
      const [modeles, dispo] = await Promise.all([
        api.get('/modeles'),
        api.get('/calendrier/disponible'),
      ]);

      selModele.innerHTML = modeles.map((m) =>
        `<option value="${m.idModele}">${escapeHtml((m.marque ? m.marque + ' ' : '') + m.modeleVehicule.trim())}</option>`
      ).join('');

      // créneaux libres à venir, regroupés par jour
      const now = Date.now();
      slotsByDay = {};
      for (const c of dispo) {
        if (new Date(c.dateHeure).getTime() < now) continue;
        const day = c.dateHeure.slice(0, 10);
        (slotsByDay[day] ??= []).push(c.dateHeure);
      }

      const days = Object.keys(slotsByDay).sort();
      if (days.length) {
        dateInput.min = days[0];
        dateInput.max = days[days.length - 1];
      }
    } catch (err) {
      showError('Chargement impossible : ' + err.message);
    }
  }

  dateInput.addEventListener('change', renderSlots);

  chips.addEventListener('click', (e) => {
    const btn = e.target.closest('.slot-chip');
    if (!btn) return;
    selectedIso = btn.dataset.iso;
    chips.querySelectorAll('.slot-chip').forEach((c) => c.classList.toggle('selected', c === btn));
  });

  container.querySelector('#btn-new-lecon').addEventListener('click', openModal);
  container.querySelector('#modal-close').addEventListener('click', closeModal);
  container.querySelector('#modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    if (!form.idMoniteur.value) return showError('Choisis un moniteur.');
    if (!form.idModele.value)   return showError('Choisis un véhicule.');
    if (!dateInput.value)       return showError('Choisis un jour.');
    if (!selectedIso)           return showError('Choisis un créneau horaire.');

    const payload = {
      idEleve:    Number(id),
      idMoniteur: Number(form.idMoniteur.value),
      idModele:   Number(form.idModele.value),
      dateHeure:  selectedIso,
      duree:      Number(form.duree.value),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Création…';
    try {
      await api.post('/lecons', payload);
      closeModal();
      render(container, { id }); // recharge la fiche (compteur + historique à jour)
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Créer la leçon';
    }
  });
}
