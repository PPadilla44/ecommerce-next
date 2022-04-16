import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import User from "../../../models/User";
import db from "../../../utils/db";
import bcrpyt from "bcryptjs"
import signToken from "../../../utils/auth";


const handler = nc<NextApiRequest, NextApiResponse>();

handler.post(async (req, res) => {
    await db.connect();
    const { name, email, password } = req.body;
    const newUser = new User({
        name,
        email,
        password: bcrpyt.hashSync(password),
        isAdmin: false
    });
    const user = await newUser.save();
    await db.disconnect();
    
    const token = signToken(user);
    res.send({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    });
})

export default handler;