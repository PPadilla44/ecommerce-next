import { NextApiResponse } from "next";
import nc from "next-connect";
import User from "../../../models/User";
import db from "../../../utils/db";
import { isAuth, signToken } from "../../../utils/auth";
import { NextApiRequestWithUser } from "../../../types";
import bcrypt from "bcryptjs";

const handler = nc<NextApiRequestWithUser, NextApiResponse>();

handler.use(isAuth);

handler.put(async (req, res) => {
  await db.connect();
  const user = await User.findById(req.user._id);
  if (!user) {
    await db.disconnect();
    return res.status(404).send({ message: "not found" });
  }
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password
    ? bcrypt.hashSync(req.body.password)
    : user.password;
  await user.save();
  await db.disconnect();

  const token = signToken(user);
  res.send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});

export default handler;
