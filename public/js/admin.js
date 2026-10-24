const tableHead = document.querySelector('.admin-table thead');
const table = document.querySelector('.admin-content table');
const head = table.querySelector('thead');
const body = table.querySelector('tbody');
const feedback = document.querySelector('.admin-feedback');
const productForm = document.querySelector('#product-form');
const addButton = document.querySelector('#admin-add');
const title = document.querySelector('#admin-resource-title');
let resource = 'products';
let rows = [];

function showFeedback(message, error = false) {
    feedback.textContent = message;
    feedback.classList.toggle('is-error', error);
}

function formatValue(value) {
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return value.map((item) => `${item.quantity} x ${item.name}`).join(', ');
    if (typeof value === 'object' && value) return JSON.stringify(value);
    return String(value ?? '');
}

function renderRows() {
    const columns = resource === 'products'
        ? ['id', 'name', 'category', 'price', 'available']
        : resource === 'orders'
            ? ['id', 'user_id', 'items', 'total', 'status', 'created_at']
            : resource === 'users'
                ? ['id', 'name', 'email', 'role', 'created_at']
                : ['id', 'name', 'last_name', 'phone', 'email', 'status', 'created_at'];
    head.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join('')}<th>Acciones</th></tr>`;
    body.replaceChildren();
    rows.forEach((row) => {
        const tr = document.createElement('tr');
        columns.forEach((column) => {
            const td = document.createElement('td');
            td.textContent = formatValue(row[column]);
            tr.append(td);
        });
        const actions = document.createElement('td');
        if (resource === 'products') {
            const edit = document.createElement('button');
            edit.textContent = 'Editar';
            edit.addEventListener('click', () => editProduct(row));
            const remove = document.createElement('button');
            remove.textContent = 'Eliminar';
            remove.addEventListener('click', () => removeProduct(row.id));
            actions.append(edit, remove);
        } else if (resource === 'orders' || resource === 'reservations') {
            const status = document.createElement('select');
            ['pending', 'confirmed', 'completed', 'cancelled'].forEach((value) => {
                const option = new Option(value, value, false, value === row.status);
                status.append(option);
            });
            status.addEventListener('change', () => updateRow(row.id, { status: status.value }));
            actions.append(status);
        }
        tr.append(actions);
        body.append(tr);
    });
}

async function loadResource() {
    const response = await fetch(`/api/admin/${resource}`);
    if (!response.ok) throw new Error((await response.json()).message || 'No se pudo cargar el módulo.');
    rows = (await response.json()).data;
    document.querySelector('#admin-record-count').textContent = String(rows.length);
    title.textContent = {
        products: 'Catálogo de productos',
        orders: 'Pedidos',
        users: 'Usuarios',
        reservations: 'Reservas'
    }[resource];
    if (resource !== 'products') productForm.hidden = true;
    addButton.hidden = resource !== 'products';
    renderRows();
}

async function updateRow(id, payload) {
    const response = await fetch(`/api/admin/${resource}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error((await response.json()).message || 'No se pudo actualizar.');
    showFeedback('Cambio guardado.');
}

function editProduct(product) {
    Object.entries(product).forEach(([key, value]) => {
        const input = productForm.elements[key];
        if (!input) return;
        if (input.type === 'checkbox') input.checked = value;
        else input.value = value;
    });
    productForm.dataset.editing = product.id;
    productForm.scrollIntoView({ behavior: 'smooth' });
}

async function removeProduct(id) {
    if (!window.confirm('¿Eliminar este producto?')) return;
    const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('No se pudo eliminar el producto.');
    await loadResource();
}

productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(productForm));
    data.price = Number(data.price);
    data.available = productForm.elements.available.checked;
    const editing = productForm.dataset.editing;
    const response = await fetch(editing ? `/api/admin/products/${editing}` : '/api/admin/products', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error((await response.json()).message || 'No se pudo guardar.');
    productForm.reset();
    delete productForm.dataset.editing;
    await loadResource();
});

document.querySelectorAll('[data-resource]').forEach((button) => {
    button.addEventListener('click', async () => {
        resource = button.dataset.resource;
        try { await loadResource(); } catch (error) { showFeedback(error.message, true); }
    });
});
addButton.addEventListener('click', () => {
    productForm.hidden = false;
    productForm.reset();
    delete productForm.dataset.editing;
    productForm.elements.available.checked = true;
    productForm.elements.id.focus();
});
loadResource().catch((error) => showFeedback(error.message, true));
