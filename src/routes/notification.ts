import { Router } from 'express';
import notificationController from '../controllers/notificationController';
const router = Router();
router.get('/notification/:id', notificationController.getNotificationsByOwnerId);
router.delete('/notification/:id', notificationController.deleteNotification);
router.delete('/notification/all/:id', notificationController.deleteAllNotificationsbyOwnerID);
export default router;