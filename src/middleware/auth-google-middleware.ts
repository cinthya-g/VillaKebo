import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Application } from 'express'; 
import session from 'express-session';

export const googleAuth = (app: Application) => {
    passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK
          },
          (accessToken, refreshToken, profile, cb) => {
            // This callback will be called after Google's authentication process
            // You can perform user validation or save user data to the database here
            console.log('User profile:', profile);
            return cb(null, profile);
          }
        )
    );
    
    passport.serializeUser((user, cb) => {
        cb(null, user);
    });
      
    passport.deserializeUser((user, cb) => {
        cb(null, user);
    });

    app.use(session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.GOOGLE_CLIENT_SECRET 
    }));
    
    // Initialize Passport and restore authentication state if available from the session
    app.use(passport.initialize());
    app.use(passport.session());
}