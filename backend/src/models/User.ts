import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: 'users' })
export default class User extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    provider_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    bucket_id!: string;

    //this accessToken is currently only for google
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    accessToken!: string;

    //this refreshToken is currently only for google
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    refreshToken!: string;
}