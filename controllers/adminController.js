import { requireSupabase } from '../lib/supabase.js';
import { email, isOrderStatus, isUserRole, positiveInteger, text } from '../lib/validation.js';

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

function validatePayload(resource, payload, partial = false) {
    const required = resource === 'products' ? ['id', 'name', 'category', 'price']
        : resource === 'reservations' ? ['name', 'last_name', 'phone', 'email']
            : [];
    if (!partial && required.some((field) => payload[field] === undefined)) {
        return 'Faltan campos obligatorios.';
    }
    if (payload.name !== undefined && !text(payload.name, { max: 80 })) return 'El nombre no es válido.';
    if (payload.last_name !== undefined && !text(payload.last_name, { max: 80 })) return 'El apellido no es válido.';
    if (payload.email !== undefined && !email(payload.email)) return 'El correo no es válido.';
    if (payload.phone !== undefined && !text(payload.phone, { min: 7, max: 30 })) return 'El teléfono no es válido.';
    if (payload.id !== undefined && !text(payload.id, { max: 120 })) return 'El identificador no es válido.';
    if (payload.category !== undefined && !text(payload.category, { max: 80 })) return 'La categoría no es válida.';
    if (payload.description !== undefined && typeof payload.description !== 'string') return 'La descripción no es válida.';
    if (payload.price !== undefined && !positiveInteger(payload.price)) return 'El precio debe ser un entero positivo.';
    if (payload.available !== undefined && typeof payload.available !== 'boolean') return 'La disponibilidad no es válida.';
    if (payload.role !== undefined && !isUserRole(payload.role)) return 'El rol no es válido.';
    if (payload.status !== undefined && !isOrderStatus(payload.status)) return 'El estado no es válido.';
    return null;
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
    const validationMessage = validatePayload(resource, payload);
    if (validationMessage) return res.status(400).json({ message: validationMessage });
    if (payload.price !== undefined) payload.price = Number(payload.price);
    const { data, error } = await table(resource).insert(payload).select(tables[resource]).single();
    if (error) throw error;
    return res.status(201).json({ data });
}

export async function updateResource(req, res) {
    const resource = req.params.resource;
    const payload = pickFields(resource, req.body || {});
    delete payload.id;
    const validationMessage = validatePayload(resource, payload, true);
    if (validationMessage) return res.status(400).json({ message: validationMessage });
    if (resource === 'products' && payload.price !== undefined) payload.price = Number(payload.price);
    if (!Object.keys(payload).length) return res.status(400).json({ message: 'No hay cambios válidos.' });
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
