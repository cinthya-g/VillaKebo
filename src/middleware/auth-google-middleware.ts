import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Application } from 'express'; 
import session from 'express-session';
import Owner from '../models/owner';
import { hashPassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import crypto from 'crypto';

export const googleAuth = (app: Application) => {
    passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK
          },
          async (accessToken, refreshToken, profile, cb) => {
            // This callback will be called after Google's authentication process
            // The user will be saved in the database here
            try{
              // Check if the user's google email is already in the database
                var user = await Owner.findOne({ email: profile.emails[0].value.toLowerCase() });
                if (!user) {
                    const newUser = {
                        email: profile.emails[0].value.toLowerCase(),
                        username: profile.displayName,
                        isOwner: true,
                        // mock-random password because it is required
                        password: hashPassword(crypto.randomBytes(4).toString('hex')),
                        profilePicture: profile.photos[0].value
                    };
                    // save the user
                    await Owner.create(newUser);
                    user = await Owner.findOne({ email: profile.emails[0].value.toLowerCase() });
                }
                // Generate token
                const token = genToken(user);
                return cb(null, { user, token });

            } catch (error) {
                return cb(error, null);
            }
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