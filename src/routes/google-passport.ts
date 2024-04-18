import { Router } from 'express';
import passport from 'passport';
import { User } from '../../types/user';


const router = Router();

router.get('/', (req, res) => {
    res.send(`<h1>Bienvenido, ${req.user ? (req.user as User).displayName : 'Invitado'}!</h1>`);
});

router.get('/login', (req, res) => {
    res.send('<a href="/google-passport/google-auth">Iniciar sesion con Google</a>');
})

router.get('/google-auth', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/google-passport/login' 
    }),
    (req, res) => {
      res.redirect('/google-passport/'); // Enviar a home
    }
);


export default router;