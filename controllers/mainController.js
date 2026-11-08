import { siteData } from '../data/siteData.js';
import { getProducts } from '../data/products.js';

export async function renderHome(req, res, next) {
    try {
        res.render('index', { ...siteData, products: await getProducts() });
    } catch (error) {
        next(error);
    }
}
