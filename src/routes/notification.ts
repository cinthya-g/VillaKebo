import { Router } from 'express';
import notificationController from '../controllers/notificationController';
const router = Router();
router.get('/notification', notificationController.getNotificationsByOwnerId);
export default router;