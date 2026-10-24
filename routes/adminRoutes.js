import { Router } from 'express';
import { createResource, deleteResource, listResource, updateResource } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/admin.js';

const adminApi = Router();
adminApi.use(requireAdmin);
adminApi.get('/:resource', listResource);
adminApi.post('/:resource', createResource);
adminApi.patch('/:resource/:id', updateResource);
adminApi.delete('/:resource/:id', deleteResource);

export default adminApi;
