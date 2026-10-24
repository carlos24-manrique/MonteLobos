import { requireSupabase } from '../lib/supabase.js';

const tables = {
    users: 'id, name, email, role, created_at',
    orders: 'id, user_id, items, total, status, created_at',
    products: 'id, name, description, category, price, available, updated_at',
    reservations: 'id, user_id, name, last_name, phone, email, status, created_at'
};

const writableFields = {
    users: ['name', 'email', 'role'],
    orders: ['status'],
    products: ['id', 'name', 'description', 'category', 'price', 'available'],
    reservations: ['name', 'last_name', 'phone', 'email', 'status']
};

function table(name) {
    if (!tables[name]) {
        const error = new Error('Recurso administrativo no válido.');
        error.status = 400;
        throw error;
    }
    return requireSupabase().from(name);
}

function pickFields(resource, payload) {
    return Object.fromEntries(writableFields[resource]
        .filter((field) => Object.prototype.hasOwnProperty.call(payload, field))
        .map((field) => [field, payload[field]]));
}

export async function listResource(req, res) {
    const resource = req.params.resource;
    const { data, error } = await table(resource)
        .select(tables[resource])
        .order(resource === 'products' ? 'name' : 'created_at', { ascending: false });
    if (error) throw error;
    return res.json({ data });
}

export async function createResource(req, res) {
    const resource = req.params.resource;
    const allowed = ['products', 'reservations'];
    if (!allowed.includes(resource)) return res.status(405).json({ message: 'Este recurso no admite creación aquí.' });
    const payload = pickFields(resource, req.body || {});
    if (resource === 'products' && (!payload.id || !payload.name || !payload.category
        || !Number.isSafeInteger(Number(payload.price)) || Number(payload.price) <= 0)) {
        return res.status(400).json({ message: 'El producto requiere id, nombre, categoría y precio válido.' });
    }
    if (resource === 'products') payload.price = Number(payload.price);
    const { data, error } = await table(resource).insert(payload).select(tables[resource]).single();
    if (error) throw error;
    return res.status(201).json({ data });
}

export async function updateResource(req, res) {
    const resource = req.params.resource;
    const payload = pickFields(resource, req.body || {});
    if (resource === 'products' && payload.price !== undefined) payload.price = Number(payload.price);
    const { data, error } = await table(resource)
        .update(payload)
        .eq('id', req.params.id)
        .select(tables[resource])
        .single();
    if (error) throw error;
    return res.json({ data });
}

export async function deleteResource(req, res) {
    const resource = req.params.resource;
    if (resource !== 'products') return res.status(405).json({ message: 'Solo los productos se pueden eliminar desde aquí.' });
    const { error } = await table(resource).delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ ok: true });
}
