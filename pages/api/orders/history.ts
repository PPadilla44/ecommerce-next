import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import Order from "../../../models/Order";
import { isAuth } from "../../../utils/auth";
import db from "../../../utils/db";
import { onError } from "../../../utils/error";

export type NextApiRequestWithUser = NextApiRequest & {
  user: any;
};

const handler = nc<NextApiRequestWithUser, NextApiResponse>({
  onError,
});

handler.use(isAuth);

handler.get(async (req, res) => {
  await db.connect();

  const orders = await Order.find({ user: req.user._id })

  await db.disconnect();
  res.send(orders);
});

export default handler;
