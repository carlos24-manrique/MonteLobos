import { Router } from 'express';
import { createResource, deleteResource, listResource, updateResource } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/admin.js';
import { productRules } from '../lib/validators.js';

// Las reglas de producto solo se aplican cuando el recurso es "products".
const onlyProducts = (rules) => (req, res, next) => {
    if (req.params.resource !== 'products') return next();
    let index = 0;
    const run = () => (index < rules.length ? rules[index++](req, res, run) : next());
    return run();
};

const adminApi = Router();
adminApi.use(requireAdmin);
adminApi.get('/:resource', listResource);
adminApi.post('/:resource', onlyProducts(productRules()), createResource);
adminApi.put('/:resource/:id', onlyProducts(productRules({ partial: true })), updateResource);
adminApi.patch('/:resource/:id', onlyProducts(productRules({ partial: true })), updateResource);
adminApi.delete('/:resource/:id', deleteResource);

export default adminApi;
