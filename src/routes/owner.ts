import { Router, RequestHandler } from 'express';
import ownerController from '../controllers/ownerController';
import authMiddleware from '../middleware/auth-middleware';
import roleMiddleware from '../middleware/role-middleware';

const router = Router();

router.post('/create-pet', authMiddleware, roleMiddleware(['owner', 'admin']), ownerController.createPet);

router.delete('/delete-pet', authMiddleware, roleMiddleware(['owner', 'admin']), ownerController.deletePet);

router.get('', (req, res) => {
    res.send('Owner Works');
});

export default router;