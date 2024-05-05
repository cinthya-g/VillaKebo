
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
            console.log('Notification saved:', savedNotification);
        } catch (error) {
            console.error('Failed to save notification:', error);
            throw new Error('Error saving notification');
        }
    }

    async  getNotificationsByOwnerId(req:Request, res:Response) {
        try {
            const userid = req.params.ownerID  // Obtener el ownerID del parámetro de la URL
            const notifications = await Notification.find({ userid: userid });
            
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
}



export default new NotificationController();
