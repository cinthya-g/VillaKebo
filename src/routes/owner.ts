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

router.put('/update-owner', ownerController.updateOwner);

router.post('/upload-photo', uploadPhoto.single('photo'), ownerController.saveUploadedPhoto);

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

router.put('/update-pet', ownerController.updatePet);

router.get('/get-pets-by-owner', ownerController.getOwnerPets);

router.post('/upload-pet-photo', uploadPhoto.single('photo'), ownerController.saveUploadedPetPhoto);

router.get('/get-pet-picture', ownerController.getPetPicture);

router.post('/upload-record', ownerController.uploadPetRecords);


export default router;