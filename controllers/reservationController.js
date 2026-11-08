import { requireSupabase } from '../lib/supabase.js';
import { email, text } from '../lib/validation.js';

export async function createReservation(req, res) {
    const name = text(req.body?.name, { max: 80 });
    const lastName = text(req.body?.lastName, { max: 80 });
    const phone = text(req.body?.phone, { min: 7, max: 30 });
    const address = email(req.body?.email);
    if (!name || !lastName || !phone || !address) {
        return res.status(400).json({ message: 'Todos los datos de la reserva son obligatorios.' });
    }

    const { data, error } = await requireSupabase().from('reservations').insert({
        user_id: req.session.user?.id || null,
        name,
        last_name: lastName,
        phone,
        email: address
    }).select('id, status, created_at').single();
    if (error) throw error;
    return res.status(201).json({ reservation: data });
}
