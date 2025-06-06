import express from 'express';
import multer from 'multer';
import { BackblazeService } from '../services/backblazeService';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

//CHECK IF USER IS AUTHENTICATED
router.get('/', (req, res) => {
    if (req.session.user) {
        // console.log(req.session.user);
        res.status(200);// Send user data as JSON
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
});

//GET USER ID
router.get('/id', (req, res) => {
    if (req.session.user) {
        const user = req.session.user;
        // console.log(req.session.user);
        res.status(200).json({userId : user.provider_id}); // Send user data as JSON
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
});

//LOGOUT
router.get('/logout', (req, res) => {
    if (req.session.user) {
        // Clear the user session
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Could not log out' });
            }
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
});

//UPLOAD FILE TO B2
router.post('/upload', upload.single('file'), async (req: express.Request, res: express.Response) => {
    if (!req.file || !req.session.user) {
        res.status(400).json({ message: 'No file uploaded or user not authenticated' });
        return;
    }

    try {

        const filePath = req.body.fullPath || req.file.originalname;
        
        const result = await BackblazeService.getInstance().uploadFile(req.session.user.bucket_id, filePath, req.file.buffer);
        console.log("Upload route LINE 120", result);
        res.json({ result });
    } catch (error) {
        console.error('Error uploading to B2:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

//GET FILE FROM B2
router.get('/files/:fileId', async (req, res) => {
    if (!req.session.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const fileId = req.params.fileId;
        const file = await BackblazeService.getInstance().downloadFile(fileId);

        // Set appropriate headers
        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        
        // Send the file
        res.send(file.data);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
});

//DELETE FILE WITH FILEID
router.delete('/files/:fileId', async (req, res) => {
    if (!req.session.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const fileId = req.params.fileId;
        await BackblazeService.getInstance().deleteFile(fileId);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
});


export default router;