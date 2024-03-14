import { Router } from 'express';
import ownerController from '../controllers/ownerController';

const router = Router();

router.post('/register', ownerController.registerOwner); 

router.get('', (req, res) => {
    res.send('Auth Works');
});

export default router;