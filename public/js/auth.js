const authDialog = document.querySelector('#auth-dialog');
const authTrigger = document.querySelector('.auth-trigger');
const authTitle = document.querySelector('#auth-title');
const authForm = document.querySelector('.auth-form');
const authNameField = document.querySelector('.auth-name-field');
const authNameInput = document.querySelector('#auth-name');
const authEmailInput = document.querySelector('#auth-email');
const authPasswordInput = document.querySelector('#auth-password');
const authSubmit = document.querySelector('.auth-submit');
const authFeedback = document.querySelector('.auth-feedback');
const authSwitch = document.querySelector('.auth-switch');
const authAccount = document.querySelector('.auth-account');
const authWelcome = document.querySelector('.auth-welcome');
let authMode = 'login';
let currentAccount = null;

function showAuthFeedback(message, isError = false) {
    authFeedback.textContent = message;
    authFeedback.classList.toggle('is-error', isError);
    authFeedback.hidden = !message;
}

function setAuthMode(mode) {
    authMode = mode;
    const isRegistration = mode === 'register';
    authTitle.textContent = isRegistration ? 'Crear cuenta' : 'Iniciar sesión';
    authNameField.hidden = !isRegistration;
    authNameInput.disabled = !isRegistration;
    authNameInput.required = isRegistration;
    authPasswordInput.autocomplete = isRegistration ? 'new-password' : 'current-password';
    authSubmit.textContent = isRegistration ? 'Crear cuenta' : 'Iniciar sesión';
    authSwitch.textContent = isRegistration ? 'Ya tengo una cuenta' : 'Crear cuenta';
    authForm.hidden = false;
    authSwitch.hidden = false;
    authAccount.hidden = true;
    authForm.reset();
    showAuthFeedback('');
}

function setCurrentAccount(account) {
    currentAccount = account;
    authTrigger.querySelector('.auth-trigger-label').textContent = account ? 'Mi cuenta' : 'Iniciar sesión';
    authWelcome.textContent = account ? `Hola, ${account.name}` : '';
}

function openAuthDialog() {
    if (currentAccount) {
        authTitle.textContent = 'Tu cuenta';
        authForm.hidden = true;
        authSwitch.hidden = true;
        authAccount.hidden = false;
        showAuthFeedback('');
    } else {
        setAuthMode('login');
    }
    authDialog.showModal();
}

authTrigger.addEventListener('click', openAuthDialog);
authDialog.querySelector('.auth-close').addEventListener('click', () => authDialog.close());
authDialog.addEventListener('click', (event) => {
    if (event.target === authDialog) authDialog.close();
});

authSwitch.addEventListener('click', () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
});

authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    authSubmit.disabled = true;

    const payload = {
        email: authEmailInput.value,
        password: authPasswordInput.value
    };
    if (authMode === 'register') payload.name = authNameInput.value;

    try {
        const response = await fetch(`/api/auth/${authMode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'No se pudo iniciar sesión.');

        setCurrentAccount(result.user);
        authDialog.close();
    } catch (error) {
        showAuthFeedback(error.message || 'No se pudo conectar con el servidor.', true);
    } finally {
        authSubmit.disabled = false;
    }
});

authDialog.querySelector('.auth-logout').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (!response.ok) throw new Error('No se pudo cerrar la sesión.');
        setCurrentAccount(null);
        authDialog.close();
    } catch (error) {
        showAuthFeedback(error.message, true);
    }
});

fetch('/api/auth/session')
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then((result) => setCurrentAccount(result.user))
    .catch(() => {});