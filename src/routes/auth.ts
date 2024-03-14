import { Router } from 'express';
import ownerController from '../controllers/ownerController';

const router = Router();

router.post('/register', ownerController.registerOwner); 
router.post('/login', ownerController.loginOwner);

//TODO User Routes (Login/Register) with middleware

router.get('', (req, res) => {
    res.send('Auth Works');
});

export default router;