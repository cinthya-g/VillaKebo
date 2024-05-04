import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../../types/user';
import authMiddleware from '../middleware/auth-middleware';
import roleMiddleware from '../middleware/role-middleware';


const router = Router();

/*
router.get('/', authMiddleware, (req: Request, res: Response) => {
    console.log("AFTER MIDDLEWARE:", req.body.user);
    res.send(`<h1>Bienvenido, ${req.body.user ? (req.body.user as User).username : 'Invitado'} !</h1>`);
});


router.get('/login', (req: Request, res: Response) => {
    res.send('<a href="/google-passport/google-auth">Iniciar sesion con Google</a>');
})
*/

router.get('/google-auth', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/google-passport/login' 
    }),
    (req: Request, res: Response) => {
        console.log("AFTER STRATEGY:", req.user);
        //res.redirect('/google-passport/'); 
        res.redirect('/home-owner.html?token=' + (req.user as User).token);
    }
);

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        } 
        req.session.destroy(function (err) {
            if (err) {
                return next(err); 
            }
            res.clearCookie('connect.sid'); 
            res.redirect('/google-passport/login'); 
        });
    });
});


export default router;
