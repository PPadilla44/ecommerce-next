import { NextApiRequest } from "next";
import { Types } from "mongoose"

export type ProductType = {
  _id?: Types.ObjectId | string;
  name: string;
  slug: string;
  category: string;
  image: string;
  price: number;
  brand: string;
  rating: number;
  numReviews: number;
  countInStock: number;
  description: string;
  reviews: ReviewType[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductForm = {
  name: string;
  slug: string;
  category: string;
  image: string;
  price: number;
  brand: string;
  countInStock: number;
  description: string;
};

export type UserType = {
  _id?: Types.ObjectId | string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ShippingAddressType = {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderType = {
  _id?: Types.ObjectId | string;
  user: string;
  orderItems: {
    _id?: Types.ObjectId | string;
    name: string;
    quantity: number;
    image: string;
    price: number;
    slug: string;
  }[];
  shippingAddress: ShippingAddressType;
  paymentMethod: string;
  paymentResult: {
    id: string;
    status: string;
    email_address: string;
  }
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt: Date;
  deliveredAt: Date;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminOrderType  = OrderType & {
    user: {
      name: string;
    }
};

export type UserRegiser = {
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
}

export type UserClientInfo = {
  token: string;
  _id?: Types.ObjectId | string;
  email: string;
  isAdmin: boolean;
  name: string;
}

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserClientInfo;
}

export type ReviewType = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}
