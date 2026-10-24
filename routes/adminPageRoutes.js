import { Router } from 'express';
import { renderAdmin } from '../controllers/adminPageController.js';
import { requireAdminPage } from '../middleware/admin.js';

const adminPageRoutes = Router();
adminPageRoutes.get('/admin', requireAdminPage, renderAdmin);
export default adminPageRoutes;
