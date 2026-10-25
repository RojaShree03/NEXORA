
import { Router } from 'express';

import {
    getDashboardOverview,
    getRecentActivity,
} from '../controllers/dashboardController.js';

import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Protect all dashboard routes.
router.use(authenticate);

router.get('/overview', getDashboardOverview);
router.get('/activity', getRecentActivity);

export default router;
