import { Router, Request, Response } from 'express';
import caretakerController from '../controllers/caretakerController';
import authMiddleware from '../middleware/auth-middleware';
import roleMiddleware from '../middleware/role-middleware';
import { uploadPhoto, uploadPDF } from '../middleware/upload-s3-middleware';

const router = Router();

// Use the authMiddleware  and roleMiddleware on all routes
router.use(authMiddleware);
router.use(roleMiddleware(['caretaker', 'admin']));

/**
 * @swagger
 * tags:
 *   name: Caretaker
 *   description: Operations related to pet caretakers
 */
router.get('', (req, res) => {
    res.send('Caretaker Works');
});

// Caretaker-Caretaker actions

/**
 * @swagger
 * /update-caretaker:
 *   put:
 *     summary: Update caretaker information
 *     tags: [Caretaker]
 *     parameters:
 *       - name: body
 *         in: body
 *         description: Updated caretaker information
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Caretaker'
 *     responses:
 *       200:
 *         description: Picture retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put('/update-caretaker', caretakerController.updateCaretaker);

/**
 * @swagger
 * /upload-photo:
 *   post:
 *     summary: Upload a photo for the caretaker
 *     tags: [Caretaker]
 *     parameters:
 *       - name: photo
 *         in: formData
 *         description: The photo to upload
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: Picture retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/upload-photo', uploadPhoto.single('photo'), caretakerController.saveUploadedPhoto);

/**
 * @swagger
 * /get-picture:
 *   get:
 *     summary: Get the picture of the caretaker
 *     tags: [Caretaker]
 *     responses:
 *       200:
 *         description: Picture retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/get-picture', caretakerController.getPicture);

// Caretaker-Reservation-Activity actions

router.put('/accomplish-activity', caretakerController.accomplishActivity);

export default router;