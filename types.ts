import { NextApiRequest } from "next";

export type ProductType = {
  _id?: string;
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
  createdAt?: string;
  updatedAt?: string;
};

export type UserType = {
  _id?: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ShippingAdressType = {
  fullName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export type OrderType = {
  _id?: string;
  user: string;
  orderItems: {
    _id?: string;
    name: string;
    quantity: number;
    image: string;
    price: number;
    slug?: string;
  }[];
  shippingAddress: ShippingAdressType;
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
  _id: string;
  email: string;
  isAdmin: boolean;
  name: string;
}

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserClientInfo;
}