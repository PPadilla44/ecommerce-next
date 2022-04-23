import { NextApiResponse } from "next";
import nc from "next-connect";
import User from "../../../../models/User";
import { NextApiRequestWithUser } from "../../../../types";
import { isAuth, isAdmin } from "../../../../utils/auth";
import db from "../../../../utils/db";
import { onError } from "../../../../utils/error";

const handler = nc<NextApiRequestWithUser, NextApiResponse>({
  onError,
});

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();

  const users = await User.find({});

  await db.disconnect();

  res.send(users);
});

export default handler;
