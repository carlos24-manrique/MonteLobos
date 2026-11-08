import { requireSupabase } from '../lib/supabase.js';
import { positiveInteger, text, validationError } from '../lib/validation.js';

export async function createOrder(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Inicia sesión para guardar tu pedido.' });
    }

    const requestedItems = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!requestedItems.length || requestedItems.length > 100) {
        return res.status(400).json({ message: 'El pedido debe contener entre 1 y 100 productos.' });
    }

    const quantities = new Map();
    for (const item of requestedItems) {
        const id = text(item?.id, { max: 120 });
        const quantity = positiveInteger(item?.quantity);
        if (!id || !quantity || quantity > 99) {
            return res.status(400).json({ message: 'El pedido contiene productos no válidos.' });
        }
        quantities.set(id, (quantities.get(id) || 0) + quantity);
    }

    const db = requireSupabase();
    const { data: products, error: productsError } = await db
        .from('products')
        .select('id, name, price, available')
        .in('id', [...quantities.keys()]);
    if (productsError) throw productsError;
    if (products.length !== quantities.size || products.some((product) => !product.available)) {
        return res.status(400).json({ message: 'Uno o más productos ya no están disponibles.' });
    }

    const items = products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantities.get(product.id)
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!Number.isSafeInteger(total) || total < 0) throw validationError('El total del pedido no es válido.');

    const { data, error } = await db.from('orders').insert({
        user_id: req.session.user.id,
        items,
        total
    }).select('id, items, total, status, created_at').single();
    if (error) throw error;
    return res.status(201).json({ order: data });
}

export async function listOrders(req, res) {
    if (!req.session.user) return res.status(401).json({ message: 'Inicia sesión para ver tus pedidos.' });
    const { data, error } = await requireSupabase().from('orders')
        .select('id, items, total, status, created_at')
        .eq('user_id', req.session.user.id)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ orders: data });
}
