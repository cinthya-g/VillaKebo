import { Router } from 'express';
import notificationController from '../controllers/notificationController';
const router = Router();
router.get('/notifications/:ownerID', notificationController.getNotificationsByOwnerId);
export default router;