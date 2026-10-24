import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const products = JSON.parse(await readFile(new URL('../data/products.json', import.meta.url), 'utf8'));
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { error } = await db.from('products').upsert(products, { onConflict: 'id' });
if (error) throw error;
console.log(`Productos cargados: ${products.length}`);
