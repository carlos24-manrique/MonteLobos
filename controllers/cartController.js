import { requireSupabase } from '../lib/supabase.js';

function getUserId(req, res) {
    if (!req.session.user) {
        res.status(401).json({ message: 'Inicia sesión para acceder a tu carrito.' });
        return null;
    }
    return req.session.user.id;
}

function validItems(items) {
    return Array.isArray(items) && items.every((item) => item
        && typeof item.id === 'string'
        && typeof item.name === 'string'
        && Number.isSafeInteger(item.price) && item.price > 0
        && Number.isSafeInteger(item.quantity) && item.quantity > 0);
}

export async function getCart(req, res) {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { data, error } = await requireSupabase()
        .from('users')
        .select('cart_items')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return res.json({ items: Array.isArray(data.cart_items) ? data.cart_items : [] });
}

export async function updateCart(req, res) {
    const userId = getUserId(req, res);
    if (!userId) return;
    const items = req.body?.items;
    if (!validItems(items)) {
        return res.status(400).json({ message: 'El carrito no es válido.' });
    }

    const { error } = await requireSupabase()
        .from('users')
        .update({ cart_items: items })
        .eq('id', userId);
    if (error) throw error;
    return res.json({ items });
}
