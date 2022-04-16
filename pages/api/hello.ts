import type { NextApiRequest, NextApiResponse } from 'next'
import User from '../../models/User';
import db from '../../utils/db'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await db.connect();
    const user = new User({
        name: 'pab',
        email: 'asd',
        password: 'das',
        isAdmin: false
    });
    console.log(user);
    
    await db.disconnect();
    res.status(200).json({ name: "John" })
}

export default handler;
