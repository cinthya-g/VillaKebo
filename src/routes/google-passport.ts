import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../../types/user';


const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send(`<h1>Bienvenido, ${req.user ? (req.user as User).displayName : 'Invitado'}!</h1>`);
});

router.get('/login', (req: Request, res: Response) => {
    res.send('<a href="/google-passport/google-auth">Iniciar sesion con Google</a>');
})

router.get('/google-auth', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/google-passport/login' 
    }),
    (req: Request, res: Response) => {
      res.redirect('/google-passport/'); 
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
