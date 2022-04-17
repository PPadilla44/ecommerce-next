import jwt from "jsonwebtoken";
import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { NextApiRequestWithUser } from "../pages/api/orders";
import { UserType } from "../types";

const signToken = (user: UserType) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET ? process.env.JWT_SECRET : "",
    {
      expiresIn: "30d",
    }
  );
};

const isAuth = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse,
  next: NextHandler
) => {
  const { authorization } = req.headers; 
  
  if (authorization) {
    //Bearer xxx
    const token = authorization.slice(7, authorization.length);
    jwt.verify(
      token,
      process.env.JWT_SECRET ? process.env.JWT_SECRET : "",
      (err, decode) => {
        if(err) {
          res.status(401).send({ message: 'Token is not valid' })
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: 'Token is not supplied' })
  }
};

export { signToken, isAuth };
