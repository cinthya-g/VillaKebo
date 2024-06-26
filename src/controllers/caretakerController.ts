import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Caretaker from "../models/caretaker";
import Pet from "../models/pet";
import Reservation from "../models/reservation";
import { deleteFileFromS3, getS3Url } from "../middleware/upload-s3-middleware";
import Activity from "../models/activity";
import Owner from "../models/owner";
import {getIo} from '../utils/io';
import Notifications from './notificationController';
import Notification from "../models/notification";




class CaretakerController{
    /**
     * @swagger
     * /auth/caretaker-login:
     *   post:
     *     tags: [Caretaker]
     *     summary: Log in a caretaker
     *     description: Authenticates a caretaker using their email and password, returning an authentication token and caretaker details if successful.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Caretaker's email address
     *               password:
     *                 type: string
     *                 format: password
     *                 description: Caretaker's password
     *     responses:
     *       200:
     *         description: Successful login
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: Authentication token issued upon successful authentication
     *                 user:
     *                   $ref: '#/components/schemas/Caretaker'
     *       400:
     *         description: Missing required fields such as email or password
     *       401:
     *         description: Authentication failed due to invalid credentials or caretaker not found
     *       500:
     *         description: Internal Server Error
     */
    async loginCaretaker(req: Request, res: Response) {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const caretaker = await Caretaker.findOne({ email: email.toLowerCase() });
            if (!caretaker || !comparePassword(password, caretaker.password)) {
                res.status(ResponseCodes.UNAUTHENTICATED).send("Caretaker not found or incorrect password");
                return;
            }
            
            const token = genToken(caretaker);
            res.status(ResponseCodes.SUCCESS).json(
                {
                    token: token,
                    user: caretaker
                }
            );
        }
        catch (error) {
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    /**
     * @swagger
     * /caretaker/update-caretaker:
     *   put:
     *     tags: [Caretaker]
     *     summary: Update caretaker details
     *     description: Updates the details of an existing caretaker based on the provided information in the request body.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user
     *               - update
     *             properties:
     *               user:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: The ID of the caretaker to be updated
     *               update:
     *                 type: object
     *                 description: The fields of the caretaker to update with new values
     *                 properties:
     *                   username:
     *                     type: string
     *                     description: New username of the caretaker
     *                   email:
     *                     type: string
     *                     format: email
     *                     description: New email address of the caretaker
     *                   password:
     *                     type: string
     *                     format: password
     *                     description: New password for the caretaker
     *     responses:
     *       200:
     *         description: Caretaker details updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Caretaker'
     *       400:
     *         description: Missing required fields or incorrect update data
     *       500:
     *         description: Internal Server Error
     */
    async updateCaretaker(req: Request, res: Response) {
        try{
            const options = { new: true }; 

            let caretakerID = req.body.user.id;
            let {update} = req.body;
            
            if (!caretakerID || !update) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            const updatedCaretaker = await Caretaker.findOneAndUpdate({ _id: caretakerID }, update, options);
            res.status(ResponseCodes.SUCCESS).send(updatedCaretaker);
        }
        catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    /**
     * @swagger
     * /caretaker/get-caretaker:
     *   post:
     *     tags: [Caretaker]
     *     summary: Get caretaker by ID
     *     description: Retrieves the caretaker information based on the provided caretaker ID.
     *     parameters:
     *       - in: query
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the caretaker to retrieve
     *     responses:
     *       200:
     *         description: Caretaker retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Caretaker'
     *       400:
     *         description: Missing required fields
     *       500:
     *         description: Internal Server Error
     */
    async getCaretaker(req: Request, res: Response) {
        try {
            const caretakerID = req.body.user.id;

            if (!caretakerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const caretaker = await Caretaker.findById(caretakerID);

            if (!caretaker) {
                res.status(ResponseCodes.NOT_FOUND).send("Caretaker not found");
                return;
            }

            res.status(ResponseCodes.SUCCESS).json(caretaker);
        } catch (error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    /**
     * @swagger
     * /caretaker/upload-photo:
     *   post:
     *     tags: [Caretaker]
     *     summary: Upload a profile photo for a caretaker
     *     description: Uploads a photo to the caretaker's profile, replacing the existing one if applicable, and returns the updated caretaker information including the new photo.
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - caretakerID
     *               - file
     *             properties:
     *               caretakerID:
     *                 type: string
     *                 description: The ID of the caretaker whose photo is being uploaded
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: The photo file to upload
     *     responses:
     *       200:
     *         description: Photo uploaded successfully and caretaker profile updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Caretaker'
     *       400:
     *         description: Missing required fields or incorrect file format
     *       500:
     *         description: Internal Server Error
     */
    async saveUploadedPhoto(req: Request, res: Response) {
        try {
            const options = { new: true };
            const fileName =  req.file.originalname;
            const { caretakerID } = req.body;

            if (!caretakerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            // Look for the previous photo on the S3 bucket and delete it 
            const caretaker = await Caretaker.findOne({ _id: caretakerID });
            if (caretaker.profilePicture) {

                // If the photo is the 'no-user-photo.png', don't delete it from S3, just create a new one and update the caretaker
                if (caretaker.profilePicture !== 'no-user-photo.png') {
                    await deleteFileFromS3(process.env.PHOTOS_BUCKET_NAME, caretaker.profilePicture);
                }

            }

            // Save the uploaded photo to the caretaker's profile
            const updatedCaretaker = await Caretaker.findOneAndUpdate({ _id: caretakerID }, { profilePicture: fileName }, options);
            res.status(ResponseCodes.SUCCESS).send(updatedCaretaker);
        
        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    /**
     * @swagger
     * /caretaker/get-picture:
     *   get:
     *     tags: [Caretaker]
     *     summary: Get the profile picture of a caretaker
     *     description: Retrieves the URL of the profile picture for the specified caretaker based on the caretaker ID provided in the request body.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id
     *             properties:
     *               id:
     *                 type: string
     *                 description: The ID of the caretaker to retrieve the picture for
     *     responses:
     *       200:
     *         description: Profile picture URL retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 url:
     *                   type: string
     *                   description: URL of the profile picture
     *       400:
     *         description: Missing required fields
     *       500:
     *         description: Internal Server Error
     */
    async getPicture(req: Request, res: Response) {
        try {
            const caretakerID = req.body.user.id;
            if (!caretakerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const caretaker = await Caretaker .findOne({ _id: caretakerID }, 'profilePicture');
            const pictureUrl = getS3Url(process.env.PHOTOS_BUCKET_NAME, caretaker.profilePicture);
            res.status(ResponseCodes.SUCCESS).send(pictureUrl);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }

    }


    async getAssignedReservations(req: Request, res: Response) {
        try {
            const caretakerID = req.body.user.id;
            if (!caretakerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const caretaker = await Caretaker.findOne({ _id: caretakerID });
            const reservations = await Reservation.find({ _id: { $in: caretaker.assignedReservationsIDs } });
            res.status(ResponseCodes.SUCCESS).send(reservations);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async getAssignedActivities(req: Request, res: Response) {
        try {
            //const caretakerID = req.body.user.id;
            const reservationID = req.params.reservationID;

            if (!reservationID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            //const caretaker = await Caretaker.findOne({ _id: caretakerID });
            // Get the reservation by its ID
            const reservation = await Reservation.findOne({ _id: reservationID });
            // Get the activities from that reservation from its activitiesIDs array
            const activities = await Activity.find({ _id: { $in: reservation.activitiesIDs } });
            res.status(ResponseCodes.SUCCESS).send(activities);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    
    async getAssignedPets(req: Request, res: Response) {
        try {
            const caretakerID = req.params.id;
            //console.log('CaretakerID in getassignedpets:', caretakerID);
            if (!caretakerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const caretaker = await Caretaker.findOne({ _id: caretakerID });
            const reservations = await Reservation.find({ _id: { $in: caretaker.assignedReservationsIDs } });
            const pets = await Pet.find({ _id: { $in: reservations.map(reservation => reservation.petID) }});
            
            res.status(ResponseCodes.SUCCESS).send(pets);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    async getAssignedPetsByID(req: Request, res: Response) {
        try {
            const petID = req.params.petID;
            //console.log('PetID in getassignedpets:', petID);
            const pets = await Pet.findById({ _id: petID});

            
            res.status(ResponseCodes.SUCCESS).send(pets);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    /**
     * @swagger
     * /owner/get-record:
     *   get:
     *     tags: [Owner]
     *     summary: Get the pet's medical record
     *     description: Retrieves the URL of the pet's medical record file stored in S3. Validates if the pet belongs to the owner before proceeding.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - petID
     *             properties:
     *               petID:
     *                 type: string
     *                 description: The pet's unique identifier
     *     responses:
     *       200:
     *         description: URL of the pet's medical record retrieved successfully
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *       400:
     *         description: Missing required fields, such as pet ID
     *       401:
     *         description: Unauthorized access or pet does not belong to the owner
     *       500:
     *         description: Internal Server Error
     */
    async getPetRecord(req: Request, res: Response) {
        try {
            const petID = req.params.id;

            if (!petID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            // Get the pet's record
            const pet = await Pet.findOne({ _id: petID }, 'record');
            const recordUrl = getS3Url(process.env.FILES_BUCKET_NAME, pet.record);
            res.status(ResponseCodes.SUCCESS).json({url: recordUrl});

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }

    }

    /**
     * @swagger
     * /caretaker/accomplish-activity:
     *   put:
     *     tags: [Caretaker]
     *     summary: Mark an activity as accomplished
     *     description: Increments the 'timesCompleted' field for a specified activity by the caretaker.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - activityId
     *             properties:
     *               activityId:
     *                 type: string
     *                 description: The unique identifier of the activity to update
     *     responses:
     *       200:
     *         description: Activity accomplished successfully
     *       400:
     *         description: Missing required fields or no activity found
     *       500:
     *         description: Internal Server Error
     */
    async accomplishActivity(req: Request, res: Response) {
        try {
            const { activityId } = req.body;
            console.log('ActivityID:', activityId);
    
            if (!activityId) {
                res.status(400).send("Missing required fields: activityId"); // BAD_REQUEST
                return;
            }
    
            // Busca la actividad y incrementa el contador 'timesCompleted'
            const updatedActivity = await Activity.findOneAndUpdate(
                { _id: activityId },
                { $inc: { timesCompleted: 1 } },
                { new: true, runValidators: true }
            );
    
            if (!updatedActivity) {
                res.status(404).send("No activity found with the provided ID"); // NOT_FOUND
                return;
            }
    
            // Encuentra la reserva asociada a la actividad
            const reservation = await Reservation.findById(updatedActivity.reservationID);
    
            if (!reservation) {
                res.status(404).send("No reservation found for this activity"); // NOT_FOUND
                return;
            }
            const petID = reservation.petID;
            const caretakerID = req.body.user.id;
            const activityTitle = updatedActivity.title;

            const caretaker = await Caretaker.findById(caretakerID);
            const pet = await Pet.findById(petID);
    
            // Extrae el userID del owner de la reserva
            const owner = await Owner.findById(reservation.ownerID);

            if (!owner) {
                res.status(404).send("No owner found for this reservation"); // NOT_FOUND
                return;
            }
            const ownerName = owner.id;
            console.log('Owner ID in accomplish activity:', ownerName);

            const Server = getIo();
            console.log('Server:', Server.sockets.adapter.rooms)
            // Obtener el timestamp actual
            const timestamp = Date.now();

            // Crear un objeto de fecha a partir del timestamp
            const fecha = new Date(timestamp);

            // Obtener los componentes por separado
            const anio = fecha.getFullYear();
            const mes = fecha.getMonth() + 1; // Los meses van de 0 a 11, por eso se suma 1
            const dia = fecha.getDate();
            const hora = fecha.getHours();
            const minutos = fecha.getMinutes();

            const fechaFormateada = `${dia}/${mes}/${anio}`;
            const horaFormateada = `${hora}:${minutos}`;
            await Notifications.saveNotification(owner.id, caretakerID, petID, activityTitle, updatedActivity.timesCompleted,caretaker.username, pet.name, fechaFormateada, horaFormateada);
            const newNotification = new Notification({
                ownerID: owner.id,
                caretakerID: caretakerID,
                caretakerName: caretaker.username,
                petID: petID,
                petName: pet.name,
                activity: activityTitle,
                timesCompleted: updatedActivity.timesCompleted,
                date: fecha,
                time: hora
            });

            
           

            Server.to(ownerName).emit('AccomplishActivity', newNotification);

    
            res.status(200).send(`Activity ${updatedActivity.title} accomplished. Times completed: ${updatedActivity.timesCompleted}`); // SUCCESS
        } catch (error) {
            console.error('ERROR:', error);
            res.status(500).send("Internal Server Error"); // SERVER_ERROR
        }
    }
    
    async getOwnerByID(req: Request, res: Response){
        try{
            const ownerID = req.params.id;
            if (!ownerID) {
                res.status(400).send("Missing required fields: ownerID"); // BAD_REQUEST
                return;
            }

            const owner = await Owner.findById(ownerID);

            if (!owner) {
                res.status(404).send("No owner found with the provided ID"); // NOT_FOUND
                return;
            }
            res.status(200).send(owner);
            return
        }catch(error){
            console.error('ERROR:', error);
            res.status(500).send("Internal Server Error"); // SERVER_ERROR
        }
    }
}

export default new CaretakerController();