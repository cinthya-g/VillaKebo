import { Router, Request, Response } from 'express';
import ownerController from '../controllers/ownerController';
import authMiddleware from '../middleware/auth-middleware';
import roleMiddleware from '../middleware/role-middleware';
import { uploadPhoto, uploadPDF } from '../middleware/upload-s3-middleware';

const router = Router();

// Use the authMiddleware  and roleMiddleware on all routes
router.use(authMiddleware);
router.use(roleMiddleware(['owner', 'admin']));

/**
 * @swagger
 * tags:
 *   name: Owner
 *   description: Operations related to pet owners
 */
router.get('', (req, res) => {
    res.send('Owner Works');
});

// Owner-Owner actions
/**
 * @swagger
 * /owner/get-owner:
 *   get:
 *     tags: [Owner]
 *     summary: Get owner's information
 *     description: Retrieves the information of the owner. Requires authentication and appropriate authorization.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Owner's information retrieved successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */
router.get('/get-owner', ownerController.getOwner);

/**
 * @swagger
 * /owner/update-owner:
 *   put:
 *     tags: [Owner]
 *     summary: Update owner's information
 *     description: Allows an owner to update their profile information. Requires authentication and appropriate authorization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Specify the fields that can be updated, e.g., name, email, etc.
 *     responses:
 *       200:
 *         description: Owner's information updated successfully
 *       400:
 *         description: Missing required fields or bad request
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.put('/update-owner', ownerController.updateOwner);

/**
 * @swagger
 * /owner/upload-photo:
 *   post:
 *     tags: [Owner]
 *     summary: Upload owner's profile photo
 *     description: Allows an owner to upload a profile photo. The photo is uploaded as part of the form data.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: The photo file to upload
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: No photo uploaded or bad request
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.post('/upload-photo', uploadPhoto.single('photo'), ownerController.saveUploadedPhoto);

/**
 * @swagger
 * /owner/get-picture:
 *   get:
 *     tags: [Owner]
 *     summary: Get owner's profile picture
 *     description: Retrieves the URL of the owner's profile picture. Requires authentication and appropriate authorization.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture retrieved successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.get('/get-picture', ownerController.getPicture);

// Owner-Pet actions
/**
 * @swagger
 * /owner/create-pet:
 *  post:
 *    tags: [Owner]
 *    summary: Create a pet for the owner
 *    description: Registers a new pet under the owner's account. Requires 'owner' or 'admin' role.
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - age
 *              - breed
 *            properties:
 *              name:
 *                type: string
 *                description: Pet's name
 *              age:
 *                type: integer
 *                description: Pet's age
 *              breed:
 *                type: string
 *                description: Pet's breed
 *    responses:
 *      200:
 *        description: Pet created successfully
 *      400:
 *        description: Missing required fields
 *      500:
 *        description: Internal Server Error
 */
router.post('/create-pet', ownerController.createPet);

/**
 * @swagger
 * /owner/get-pet:
 *  get:
 *    tags: [Owner]
 *    summary: Get an owner's pet
 *    description: Retrieves a pet associated with the owner's account. Requires 'owner' or 'admin' role.
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Pet retrieved successfully
 *      400:
 *        description: Missing required fields or invalid pet ID
 *      500:
 *        description: Internal Server Error
 */
router.get('/get-pet/:id', ownerController.getPet);

/**
 * @swagger
 * /owner/delete-pet:
 *  delete:
 *    tags: [Owner]
 *    summary: Delete an owner's pet
 *    description: Removes a pet from the owner's account. Requires 'owner' or 'admin' role.
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - petID
 *            properties:
 *              petID:
 *                type: string
 *                description: The ID of the pet to delete
 *    responses:
 *      200:
 *        description: Pet deleted successfully
 *      400:
 *        description: Missing required fields or invalid pet ID
 *      500:
 *        description: Internal Server Error
 */
router.delete('/delete-pet', ownerController.deletePet);
/**
 * @swagger
 * /owner/update-pet:
 *   put:
 *     tags: [Owner]
 *     summary: Update pet information
 *     description: Updates the information of a specific pet owned by the owner. Requires authentication and appropriate authorization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Specify the fields that can be updated, e.g., name, age, etc.
 *     responses:
 *       200:
 *         description: Pet information updated successfully
 *       400:
 *         description: Missing required fields or bad request
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.put('/update-pet', ownerController.updatePet);
/**
 * @swagger
 * /owner/get-pets-by-owner:
 *   get:
 *     tags: [Owner]
 *     summary: Get all pets owned by the owner
 *     description: Retrieves all pets associated with the owner's account. Requires authentication and appropriate authorization.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pets
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.get('/get-pets-by-owner', ownerController.getOwnerPets);
/**
 * @swagger
 * /owner/upload-pet-photo:
 *   post:
 *     tags: [Owner]
 *     summary: Upload a pet's photo
 *     description: Uploads a photo for a specific pet. The file should be in the 'photo' field of the form data.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo to upload
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: No photo uploaded or bad request
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.post('/upload-pet-photo', uploadPhoto.single('photo'), ownerController.saveUploadedPetPhoto);
/**
 * @swagger
 * /owner/get-pet-picture:
 *   get:
 *     tags: [Owner]
 *     summary: Get a pet's profile picture
 *     description: Retrieves the URL of a pet's profile picture. Requires authentication and appropriate authorization.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture retrieved successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.get('/get-pet-picture', ownerController.getPetPicture);
/**
 * @swagger
 * /owner/upload-record:
 *   post:
 *     tags: [Owner]
 *     summary: Upload a pet's medical record
 *     description: Uploads a medical record file for a specific pet. The file should be in the 'pdf' field of the form data.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload as the pet's medical record
 *     responses:
 *       200:
 *         description: Medical record uploaded successfully
 *       400:
 *         description: No file uploaded or bad request
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.post('/upload-record', uploadPDF.single('pdf'), ownerController.uploadPetRecord);
/**
 * @swagger
 * /owner/get-record:
 *   get:
 *     tags: [Owner]
 *     summary: Get a pet's medical record
 *     description: Retrieves the URL of a pet's medical record file. Requires authentication and appropriate authorization.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medical record retrieved successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.get('/get-record', ownerController.getPetRecord);


// Owner-Pet-Reservation  actions
/**
 * @swagger
 * /owner/create-reservation:
 *   post:
 *     tags: [Owner]
 *     summary: Create a new reservation
 *     description: Creates a new reservation for a pet owned by the owner. Requires authentication and appropriate authorization.
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
 *               - startDate
 *               - endDate
 *             properties:
 *               petID:
 *                 type: string
 *                 description: The unique identifier of the pet
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the reservation
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the reservation
 *     responses:
 *       200:
 *         description: Reservation created successfully
 *       400:
 *         description: Missing required fields or invalid data
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.post('/create-reservation', ownerController.createReservation);
/**
 * @swagger
 * /owner/confirm-reservation:
 *   put:
 *     tags: [Owner]
 *     summary: Confirm a reservation
 *     description: Confirms an existing reservation, changing its status to confirmed. Requires authentication and that the reservation has at least one activity.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationID
 *             properties:
 *               reservationID:
 *                 type: string
 *                 description: The unique identifier of the reservation to be confirmed
 *     responses:
 *       200:
 *         description: Reservation confirmed successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized access or reservation cannot be confirmed
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Internal Server Error
 */

router.put('/confirm-reservation', ownerController.confirmReservation);
/**
 * @swagger
 * /owner/cancel-reservation:
 *   delete:
 *     tags: [Owner]
 *     summary: Cancel a reservation
 *     description: Cancels an existing reservation and deletes it. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationID
 *             properties:
 *               reservationID:
 *                 type: string
 *                 description: The unique identifier of the reservation to cancel
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Internal Server Error
 */

router.delete('/cancel-reservation', ownerController.cancelReservation);
/**
 * @swagger
 * /owner/get-reservations-by-owner:
 *   get:
 *     tags: [Owner]
 *     summary: Get reservations made by the owner
 *     description: Retrieves all reservations made by the owner. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation' // Assumes a Reservation schema is defined
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.get('/get-reservations-by-owner', ownerController.getOwnerReservations);


// Owner-Pet-Activity actions
/**
 * @swagger
 * /owner/create-activity:
 *   post:
 *     tags: [Owner]
 *     summary: Create a new activity for a reservation
 *     description: Adds a new activity to a reservation. Requires authentication and authorization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationID
 *               - title
 *               - description
 *               - frequency
 *             properties:
 *               reservationID:
 *                 type: string
 *                 description: The unique identifier of the reservation
 *               title:
 *                 type: string
 *                 description: Title of the activity
 *               description:
 *                 type: string
 *                 description: Description of the activity
 *               frequency:
 *                 type: string
 *                 description: Frequency of the activity
 *     responses:
 *       200:
 *         description: Activity created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.post('/create-activity', ownerController.createActivity);
/**
 * @swagger
 * /owner/update-activity:
 *   put:
 *     tags: [Owner]
 *     summary: Update an existing activity
 *     description: Updates the details of an existing activity. Requires authentication and authorization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityID
 *               - update
 *             properties:
 *               activityID:
 *                 type: string
 *                 description: The unique identifier of the activity to be updated
 *               update:
 *                 type: object
 *                 description: Fields to update with their new values
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       400:
 *         description: Missing required fields or invalid data
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.put('/update-activity', ownerController.updateActivity);
/**
 * @swagger
 * /owner/delete-activity:
 *   delete:
 *     tags: [Owner]
 *     summary: Delete an activity
 *     description: Deletes an activity from a reservation. Requires authentication and authorization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityID
 *             properties:
 *               activityID:
 *                 type: string
 *                 description: The unique identifier of the activity to be deleted
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal Server Error
 */

router.delete('/delete-activity', ownerController.deleteActivity);
/**
 * @swagger
 * /owner/get-activities-by-reservation:
 *   get:
 *     tags: [Owner]
 *     summary: Get activities for a reservation
 *     description: Retrieves all activities associated with a specific reservation. Requires authentication and authorization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationID
 *             properties:
 *               reservationID:
 *                 type: string
 *                 description: The unique identifier of the reservation to fetch activities for
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal Server Error
 */

router.get('/get-activities-by-reservation', ownerController.getReservationActivities);

export default router;