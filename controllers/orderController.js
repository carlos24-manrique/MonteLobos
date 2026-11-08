import { requireSupabase } from '../lib/supabase.js';

export async function createOrder(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Inicia sesión para guardar tu pedido.' });
    }

    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const total = Number(req.body?.total);
    if (!items.length || !Number.isSafeInteger(total) || total < 0) {
        return res.status(400).json({ message: 'El pedido no es válido.' });
    }

    const { data, error } = await requireSupabase().from('orders').insert({
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
