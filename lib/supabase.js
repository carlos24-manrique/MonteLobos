import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = supabaseConfigured
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
    : null;

export function requireSupabase() {
    if (!supabase) {
        const error = new Error('Supabase no está configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
        error.status = 503;
        throw error;
    }
    return supabase;
}
