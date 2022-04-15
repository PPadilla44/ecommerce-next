import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import Product from "../../../models/Prouct";
import db from "../../../utils/db";

const handler = nc<NextApiRequest, NextApiResponse>();

handler.get(async (req, res) => {
    await db.connect();
    const product = await Product.findById(req.query._id);
    await db.disconnect();
    res.send(product)
})

export default handler;