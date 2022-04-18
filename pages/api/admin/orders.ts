import { NextApiResponse } from "next";
import nc from "next-connect";
import Order from "../../../models/Order";
import { NextApiRequestWithUser } from "../../../types";
import { isAuth, isAdmin } from "../../../utils/auth";
import db from "../../../utils/db";
import { onError } from "../../../utils/error";

const handler = nc<NextApiRequestWithUser, NextApiResponse>({
  onError,
});

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();

  const orders = await Order.find({}).populate('user', 'name');
  
  await db.disconnect();
  
  res.send(orders);
});

export default handler;
