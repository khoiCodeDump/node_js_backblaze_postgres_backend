import passport from 'passport';
// import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User';
import { BackblazeService } from '../services/backblazeService';

dotenv.config();


// passport.use("github", new GitHubStrategy({
//     clientID: process.env.GITHUB_CLIENT_ID as string,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
//     callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
// }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
//     // console.log(profile);
//     try {
//         let user = await User.findOne({ where: {provider_id: "github-"+profile.id}});
//         if (!user) {
//             const folder = await BackblazeService.getInstance().createFolder(`github-${profile.id}`);
//             await createContainer(`github-${profile.id}`);
//             user = await User.create({
//                 provider_id: "github-"+profile.id,
//                 github_username: profile.username,
//                 cloud_link: folder.bucketId,
//                 linkedIn_url: '',
//                 accessToken: '',
//                 refreshToken: ''
//             });
//         }
//         done(null, user);
//     } catch (err: any) {
//         done(err, null);
//     }
// }));

passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
        let user = await User.findOne({ where: { provider_id: "google-"+profile.id } });
        
        if (user) {
            // Update accessToken (and refreshToken if needed)
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            await user.save();
        } else {
            const folder = await BackblazeService.getInstance().createFolder(`google-${profile.id}`);
            user = await User.create({
                provider_id: "google-"+profile.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findByPk(id); // Fetch the user from the database using the ID
        done(null, user); // Pass the user object to the next middleware
    } catch (err) {
        done(err, null);
    }
});