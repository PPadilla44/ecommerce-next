import { NextApiResponse } from "next";
import nc from "next-connect";
import Order from "../../../models/Order";
import Product from "../../../models/Prouct";
import User from "../../../models/User";
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

  const ordersCount = await Order.countDocuments();
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();
  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);

  await db.disconnect();
  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;
  res.send({ ordersCount, productsCount, usersCount, ordersPrice, salesData });
});

export default handler;
