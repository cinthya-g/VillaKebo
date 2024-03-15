import { Router } from 'express';
import ownerController from '../controllers/ownerController';
import caretakerController from '../controllers/caretakerController';
import registerController from '../controllers/registerController';

const router = Router();

router.post('/register', registerController.registerUser); 
router.post('/owner-login', ownerController.loginOwner);
router.post('/caretaker-login', caretakerController.loginCaretaker);

//TODO User Routes (Login/Register) with middleware

router.get('', (req, res) => {
    res.send('Auth Works');
});

export default router;