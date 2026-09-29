const cartStorageKey = 'montelobos-cart-v1';
const cartDialog = document.querySelector('#cart-dialog');
const cartItemsElement = document.querySelector('.cart-items');
const cartCountElement = document.querySelector('.cart-count');
const cartEmptyElement = document.querySelector('.cart-empty');
const cartTotalElement = document.querySelector('.cart-total');
const checkoutButton = document.querySelector('.cart-checkout');
let cart = loadCart();

function loadCart() {
    try {
        const storedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
        return Array.isArray(storedCart)
            ? storedCart.filter((item) => item && typeof item.id === 'string'
                && typeof item.name === 'string' && Number.isInteger(item.price)
                && Number.isInteger(item.quantity) && item.price > 0 && item.quantity > 0)
            : [];
    } catch {
        return [];
    }
}

function formatPrice(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(amount);
}

function saveCart() {
    try {
        localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch {
        // The cart remains available for the current page when storage is unavailable.
    }
}

function createCartButton(label, accessibleLabel, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-label', accessibleLabel);
    button.addEventListener('click', onClick);
    return button;
}

function changeQuantity(id, change) {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter((cartItem) => cartItem.id !== id);
    }
    saveCart();
    updateCart();
}

function updateCart() {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartCountElement.textContent = String(itemCount);
    cartEmptyElement.hidden = cart.length > 0;
    checkoutButton.disabled = cart.length === 0;
    cartTotalElement.textContent = formatPrice(total);
    cartItemsElement.replaceChildren();

    cart.forEach((item) => {
        const line = document.createElement('article');
        line.className = 'cart-line';

        const details = document.createElement('div');
        const name = document.createElement('h3');
        name.textContent = item.name;
        const price = document.createElement('p');
        price.className = 'cart-line-price';
        price.textContent = `${formatPrice(item.price)} c/u`;
        details.append(name, price);

        const lineTotal = document.createElement('strong');
        lineTotal.textContent = formatPrice(item.price * item.quantity);

        const controls = document.createElement('div');
        controls.className = 'cart-line-controls';
        controls.append(
            createCartButton('−', `Restar una unidad de ${item.name}`, () => changeQuantity(item.id, -1)),
            document.createTextNode(String(item.quantity)),
            createCartButton('+', `Agregar una unidad de ${item.name}`, () => changeQuantity(item.id, 1))
        );
        const removeButton = createCartButton('Eliminar', `Eliminar ${item.name} del carrito`, () => {
            cart = cart.filter((cartItem) => cartItem.id !== item.id);
            saveCart();
            updateCart();
        });
        removeButton.classList.add('cart-remove');
        controls.append(removeButton);
        line.append(details, lineTotal, controls);
        cartItemsElement.append(line);
    });
}

document.querySelectorAll('.menu .menu-item').forEach((menuItem) => {
    const name = menuItem.querySelector('h3')?.textContent.trim();
    const price = Number(menuItem.querySelector('.precio')?.textContent.replace(/\D/g, ''));
    if (!name || !Number.isSafeInteger(price) || price <= 0) return;

    const addButton = document.createElement('button');
    addButton.className = 'menu-add';
    addButton.type = 'button';
    addButton.textContent = 'Agregar';
    addButton.setAttribute('aria-label', `Agregar ${name} al carrito`);
    addButton.addEventListener('click', () => {
        const id = `${name.toLocaleLowerCase('es')}-${price}`;
        const existingItem = cart.find((item) => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        saveCart();
        updateCart();
    });
    menuItem.append(addButton);
});

document.querySelector('.cart-trigger')?.addEventListener('click', () => cartDialog.showModal());
cartDialog?.querySelector('.dialog-close')?.addEventListener('click', () => cartDialog.close());
cartDialog?.addEventListener('click', (event) => {
    if (event.target === cartDialog) cartDialog.close();
});

checkoutButton?.addEventListener('click', () => {
    const orderLines = cart.map((item) => `${item.quantity} x ${item.name}: ${formatPrice(item.price * item.quantity)}`);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = ['Hola, quiero hacer este pedido:', ...orderLines, `Total: ${formatPrice(total)}`].join('\n');
    window.open(`https://wa.me/3132514389?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

updateCart();