import { Router } from 'express';
import notificationController from '../controllers/notificationController';
const router = Router();
router.get('/notification/:id', notificationController.getNotificationsByOwnerId);
export default router;