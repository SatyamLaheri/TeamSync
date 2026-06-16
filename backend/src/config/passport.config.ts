import passport from "passport";
import { Request } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { ProviderEnumType } from "../enums/account-provider.enum";

import config from "../config/app.config";
import { NotFoundException } from "../utils/appError";
import UserModel from "../models/user.model";

import {
    loginOrCreateAccountService,
    verifyUserService,
  } from "../services/auth.service";

  console.log("Google OAuth Config:", {
    clientID: config.GOOGLE_CLIENT_ID ? "Set" : "Missing",
    clientSecret: config.GOOGLE_CLIENT_SECRET ? "Set" : "Missing", 
    callbackURL: config.GOOGLE_CALLBACK_URL
  });

  passport.use(
    new GoogleStrategy(
        {
          clientID: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          callbackURL: config.GOOGLE_CALLBACK_URL,
          scope: ["profile", "email"],
          passReqToCallback: true,
        },
        async (req: Request, accessToken, refreshToken, profile, done) => {
            try{
                const {email, sub:googleId,picture} = profile._json;
                console.log("google profile", profile);
                console.log("googleId", googleId);
                if(!googleId) {
                    throw new NotFoundException("Google ID  not found");
                }
                const { user } = await loginOrCreateAccountService({
                    provider: ProviderEnumType.GOOGLE,
                    providerId: googleId,
                    displayName: profile.displayName,
                    picture : picture,
                    email: email,
                });
                done(null, user);
            }
            catch (error) {
                done(error, false);
            }

        }      
    )
  );


  passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            session: true,
        },
        async (email, password, done) => {
            try{
               const user = await verifyUserService({ email, password });
               return done(null, user);
            } catch (error : any) {
                return done(error, false, {message: error.message});
            }
        }
    ))

 
  
  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user?._id);
    done(null, user._id);
  });
  
  passport.deserializeUser(async (userId: string, done) => {
    console.log("Deserializing user:", userId);
    try {
      const user = await UserModel.findById(userId);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

    
