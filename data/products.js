import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const productsFile = fileURLToPath(new URL('./products.json', import.meta.url));

export async function getProducts() {
    return JSON.parse(await readFile(productsFile, 'utf8'));
}
