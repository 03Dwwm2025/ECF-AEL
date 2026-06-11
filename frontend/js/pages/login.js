import { setToken } from '../utils/auth.js';
import { navigate } from '../router.js';

export function render(container) {
  container.innerHTML = `
    <div class="auth-page">

      <!-- Panneau de marque (gauche) -->
      <aside class="auth-brand">
        <div class="auth-brand-top">
          <span class="brand-logo">AEL</span>
          <span>Auto-École · du Lycée</span>
        </div>

        <div class="auth-brand-main">
          <h1>Le portail de gestion de votre auto-école.</h1>
          <p>Suivi des élèves, des leçons, des moniteurs et du parc de véhicules — centralisés en agence.</p>

          <div class="auth-stats">
            <div><strong>142</strong><span>élèves</span></div>
            <div><strong>4</strong><span>moniteurs</span></div>
            <div><strong>5</strong><span>véhicules</span></div>
          </div>
        </div>

        <p class="auth-brand-foot">Espace sécurisé · Agence centrale</p>
      </aside>

      <!-- Formulaire (droite) -->
      <main class="auth-form-wrap">
        <div class="auth-card">
          <h2>Connexion</h2>
          <p class="auth-sub">Espace réservé au personnel de l'agence.</p>

          <form id="form-login" novalidate>
            <div class="auth-field">
              <label for="login-email">Identifiant</label>
              <input id="login-email" name="email" type="email" autocomplete="username"
                     placeholder="admin@admin.fr" required />
            </div>

            <div class="auth-field">
              <label for="login-mdp">Mot de passe</label>
              <div class="auth-password">
                <input id="login-mdp" name="mdp" type="password" autocomplete="current-password"
                       placeholder="••••••••" required />
                <button type="button" class="auth-eye" id="toggle-mdp" aria-label="Afficher le mot de passe">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
            </div>

            <div class="auth-row">
              <label class="auth-check">
                <input type="checkbox" name="remember" /> Rester connecté
              </label>
              <a href="#" class="auth-link" id="forgot">Mot de passe oublié ?</a>
            </div>

            <p id="login-error" class="auth-error" hidden></p>

            <button type="submit" class="auth-submit" id="login-submit">Se connecter</button>
          </form>

          <p class="auth-foot"><i class="bi bi-shield-lock"></i> Connexion sécurisée · Agence centrale</p>
        </div>
      </main>
    </div>
  `;

  const form    = container.querySelector('#form-login');
  const errEl   = container.querySelector('#login-error');
  const submit  = container.querySelector('#login-submit');
  const mdpInput = container.querySelector('#login-mdp');

  // Afficher / masquer le mot de passe
  container.querySelector('#toggle-mdp').addEventListener('click', (e) => {
    const shown = mdpInput.type === 'text';
    mdpInput.type = shown ? 'password' : 'text';
    e.currentTarget.querySelector('i').className = shown ? 'bi bi-eye' : 'bi bi-eye-slash';
  });

  container.querySelector('#forgot').addEventListener('click', (e) => {
    e.preventDefault();
    showError('Contactez un administrateur pour réinitialiser votre mot de passe.');
  });

  function showError(msg) {
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.hidden = true;

    const email = form.email.value.trim();
    const mdp   = form.mdp.value;

    submit.disabled = true;
    submit.textContent = 'Connexion…';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mdp }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 400 → { erreurs: [...] }  ·  401 → { message }
        const msg = body.message
          || (body.erreurs && body.erreurs[0]?.msg)
          || 'Connexion impossible';
        throw new Error(msg);
      }

      setToken(body.token);
      navigate('/eleves');
    } catch (err) {
      showError(err.message);
      submit.disabled = false;
      submit.textContent = 'Se connecter';
    }
  });
}
