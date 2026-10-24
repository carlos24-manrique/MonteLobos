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
const authOrdersEmpty = document.querySelector('.auth-orders-empty');
const authOrdersList = document.querySelector('.auth-orders-list');
const authInvoiceCount = document.querySelector('.auth-invoice-count');
const authSpentTotal = document.querySelector('.auth-spent-total');
const authSavedCartCount = document.querySelector('.auth-saved-cart-count');
const authOpenCart = document.querySelector('.auth-open-cart');
const authAdminLink = document.querySelector('.auth-admin-link');
let authMode = 'login';
let currentAccount = null;

authOpenCart.addEventListener('click', () => {
    authDialog.close();
    window.dispatchEvent(new Event('cart:resume'));
});

window.addEventListener('cart:updated', (event) => {
    const count = event.detail?.itemCount || 0;
    authSavedCartCount.textContent = `${count} ${count === 1 ? 'producto' : 'productos'}`;
});

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
    authAdminLink.hidden = account?.role !== 'admin';
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: account } }));
}

async function loadOrders() {
    if (!currentAccount) return;
    const response = await fetch('/api/orders');
    if (!response.ok) return;
    const { orders } = await response.json();
    const spentTotal = orders.reduce((sum, order) => sum + order.total, 0);
    authInvoiceCount.textContent = String(orders.length);
    authSpentTotal.textContent = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(spentTotal);
    authOrdersList.replaceChildren();
    authOrdersEmpty.hidden = orders.length > 0;
    orders.forEach((order) => {
        const item = document.createElement('li');
        const date = new Date(order.created_at).toLocaleDateString('es-CO');
        const total = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(order.total);
        item.textContent = `${date} · ${total} · ${order.items.map((product) => `${product.quantity} x ${product.name}`).join(', ')}`;
        authOrdersList.append(item);
    });
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
        loadOrders();
        const shouldResumeCart = sessionStorage.getItem('montelobos-resume-cart') === 'true';
        if (sessionStorage.getItem('montelobos-resume-cart') === 'true') {
            sessionStorage.removeItem('montelobos-resume-cart');
        }
        authDialog.close();
        if (shouldResumeCart) window.dispatchEvent(new Event('cart:resume'));
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
        window.dispatchEvent(new Event('cart:clear'));
        authDialog.close();
    } catch (error) {
        showAuthFeedback(error.message, true);
    }
});

fetch('/api/auth/session')
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then((result) => {
        setCurrentAccount(result.user);
        return loadOrders();
    })
    .catch(() => {});