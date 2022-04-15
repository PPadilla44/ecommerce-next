import jwt from "jsonwebtoken";
import { UserType } from "../types";

const signToken = (user: UserType) => {
    return jwt.sign({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_SECRET ? process.env.JWT_SECRET : "",
        {
            expiresIn: '30d'
        }

    )
}

export default signToken;