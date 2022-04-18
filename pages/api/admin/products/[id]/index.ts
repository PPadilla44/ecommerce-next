import nc from "next-connect";
import { isAdmin, isAuth } from "../../../../../utils/auth";
import Product from "../../../../../models/Prouct";
import db from "../../../../../utils/db";
import { NextApiResponse } from "next";
import { NextApiRequestWithUser } from "../../../../../types";

const handler = nc<NextApiRequestWithUser, NextApiResponse>();

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
    await db.connect();

    const product = await Product.findById(req.query.id);

    await db.disconnect();

    res.send(product)
});

export default handler;