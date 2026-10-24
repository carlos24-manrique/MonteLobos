import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { supabaseConfigured, supabase } from '../lib/supabase.js';

const productsFile = fileURLToPath(new URL('./products.json', import.meta.url));

export async function getProducts() {
    if (supabaseConfigured) {
        const { data, error } = await supabase
            .from('products')
            .select('id, name, description, category, price, available')
            .order('category')
            .order('name');
        if (!error && data?.length) return data;
    }
    return JSON.parse(await readFile(productsFile, 'utf8'));
}
