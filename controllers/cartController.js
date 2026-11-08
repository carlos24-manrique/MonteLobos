import { requireSupabase } from '../lib/supabase.js';
import { positiveInteger, text } from '../lib/validation.js';

function getUserId(req, res) {
    if (!req.session.user) {
        res.status(401).json({ message: 'Inicia sesión para acceder a tu carrito.' });
        return null;
    }
    return req.session.user.id;
}

function validItems(items) {
    return Array.isArray(items) && items.length <= 100 && items.every((item) => item
        && text(item.id, { max: 120 })
        && text(item.name, { max: 160 })
        && positiveInteger(item.price)
        && positiveInteger(item.quantity)
        && item.quantity <= 99);
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
