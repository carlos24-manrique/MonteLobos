import { requireSupabase } from '../lib/supabase.js';

export async function createReservation(req, res) {
    const { name, lastName, phone, email } = req.body || {};
    if ([name, lastName, phone, email].some((value) => typeof value !== 'string' || !value.trim())) {
        return res.status(400).json({ message: 'Todos los datos de la reserva son obligatorios.' });
    }

    const { data, error } = await requireSupabase().from('reservations').insert({
        user_id: req.session.user?.id || null,
        name: name.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase()
    }).select('id, status, created_at').single();
    if (error) throw error;
    return res.status(201).json({ reservation: data });
}
