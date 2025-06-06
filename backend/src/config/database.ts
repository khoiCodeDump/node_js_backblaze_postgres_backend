import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const sequelize = new Sequelize({
    database: 'rag_userdb',
    username: 'rag_userdb_owner',
    password: 'npg_jhL9eQmOxM7d',
    host: 'ep-bold-wind-a6ffsy78-pooler.us-west-2.aws.neon.tech',
    dialect: 'postgres',
    models: [User],
    dialectOptions: {
        ssl: {
            require: true
        }
    }
});

export { sequelize };

