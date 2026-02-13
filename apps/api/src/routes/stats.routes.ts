import { Router } from 'express';
import { statsService } from '../services/stats.service';
import { requireAuth } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const router = Router();

// GET /stats
router.get(
  '/',
  requireAuth,
  async (req, res) => {
    try {
      const stats = await statsService.getStats();
      successResponse(res, stats, 'Stats retrieved successfully');
    } catch (error) {
      errorResponse(res, 'Failed to retrieve stats', 500);
    }
  }
);

export default router;
