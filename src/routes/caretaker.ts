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

router.put('/update-caretaker', caretakerController.updateCaretaker);

router.post('/upload-photo', uploadPhoto.single('photo'), caretakerController.saveUploadedPhoto);

router.get('/get-picture', caretakerController.getPicture);

// Caretaker-Pet-PetGroups actions

router.put('/join-group', caretakerController.joinPetGroup);

router.get('/get-groups', caretakerController.getPetGroups);

router.get('/get-group/:id', caretakerController.getPetGroup);

// Caretaker-Reservation-Activity actions

router.put('/accomplish-activity', caretakerController.accomplishActivity);

export default router;