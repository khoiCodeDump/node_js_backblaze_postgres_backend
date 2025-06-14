import app from './app';
import { sequelize } from './config/database';
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;

sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

