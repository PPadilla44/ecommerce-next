import{ Schema, model, models, Model } from "mongoose";
import { UserType } from "../types";

const userSchema = new Schema<UserType>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
},{
    timestamps: true
});

const User: Model<UserType> = models.User || model<UserType>('User', userSchema);
export default User;