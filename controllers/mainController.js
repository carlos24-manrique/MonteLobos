import { siteData } from '../data/siteData.js';

export function renderHome(req, res) {
    res.render('index', siteData);
}
