
import Notification from '../models/notification';  // Asegúrate de usar la ruta correcta
import { Request, Response } from 'express';  // Importar Request y Response de express


class NotificationController {
    // Función para guardar una notificación
    async saveNotification(ownerID:String, caretakerID:String, petID:String, activity:String, timesCompleted:Number, caretakername:String, petname:String,fecha:String,hora:String) {
        try {
            const newNotification = new Notification({
                ownerID: ownerID,
                caretakerID: caretakerID,
                caretakerName: caretakername,
                petID: petID,
                petName: petname,
                activity: activity,
                timesCompleted: timesCompleted,
                date: fecha,
                time: hora
            });

            const savedNotification = await newNotification.save();
            //console.log('Notification saved:', savedNotification);
        } catch (error) {
            console.error('Failed to save notification:', error);
            throw new Error('Error saving notification');
        }
    }

    async  getNotificationsByOwnerId(req:Request, res:Response) {
        try {
            const userid = req.params.id  // Obtener el ownerID del parámetro de la URL
            //console.log('OwnerID in getnotifications:', userid);

            const notifications = await Notification.find({ ownerID: userid });
            
            if (!notifications || notifications.length === 0) {
                res.status(404).send('No notifications found');
                return;
            }
            //console.log('OwnerID:', userid);
            //console.log('Notifications:', notifications);
    
            res.status(200).json(notifications);
        } catch (error) {
            console.error('Failed to retrieve notifications:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    async deleteNotification(req:Request, res:Response) {
        try {
            const notificationID = req.params.id;  // Obtener el ID de la notificación a eliminar
            //console.log('NotificationID:', notificationID);
            const deletedNotification = await Notification.findByIdAndDelete(notificationID);
            if (!deletedNotification) {
                res.status(404).send('Notification not found');
                return;
            }
            //console.log('Deleted notification:', deletedNotification);
            res.status(200).send('Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    async deleteAllNotificationsbyOwnerID(req:Request, res:Response) {
        try {
            const ownerID = req.params.id;  // Obtener el ID del owner a eliminar
            //console.log('OwnerID:', ownerID);
            const deletedNotifications = await Notification.deleteMany({ ownerID: ownerID });
            //console.log('Deleted notifications:', deletedNotifications);
            res.status(200).send('Notifications deleted');
        } catch (error) {
            console.error('Failed to delete notifications:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}



export default new NotificationController();
