import { Router } from "express";
import passport from "passport";
import User from '../models/User'; // Adjust the import based on your project structure

declare module 'express-session' {
    interface SessionData {
        user: {
            provider_id: string;
            accessToken: string;
            refreshToken: string;
            bucket_id: string;
        };
    }
}

const router = Router();

// // /github makes call to github server
// router.get('/github', passport.authenticate("github", { scope: ['user:email', 'read:user'] }));
// // /github/callback is the response the server sent back
// router.get('/github/callback', passport.authenticate('github', {
//     failureRedirect: process.env.FRONTEND_URL,
//     session: true
// }), (req, res) => {
//     if (req.user) {
//         const user = req.user as User; 
//         try {
//             req.session.user = {
//                 provider_id: user.provider_id,
//                 github_username: user.github_username,
//                 linkedIn_url: user.linkedIn_url,
//                 accessToken: user.accessToken,
//                 refreshToken: user.refreshToken,
//                 bucket_id: user.cloud_link
//             };
//         } catch (error) {
//             console.error("Error setting session:", error);
//         }
//     }
//     res.redirect(process.env.FRONTEND_URL);
    
// });

router.get('/google', passport.authenticate("google", { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.readonly'] }));
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL,
    session: true
}), async (req, res) => {
    if (req.user) {
        const user = req.user as User; 
        console.log("Provider ID:", user.provider_id);
        try {
            req.session.user = {
                provider_id: user.provider_id,
                accessToken: user.accessToken,
                refreshToken: user.refreshToken,
                bucket_id: user.bucket_id
            };
        } catch (error) {
            console.error("Error setting session:", error);
        }
    }
    else {
        
    }
    if (process.env.FRONTEND_URL) {
        res.redirect(process.env.FRONTEND_URL);
    } else {
        console.error("FRONTEND_URL is not set.");
    }
});


export default router;   