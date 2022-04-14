import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../utils/db'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await db.connect();
    await db.disconnect();
    res.status(200).json({ name: "John"})
}

export default handler;
