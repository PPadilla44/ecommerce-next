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
  user: string;
  orderItems: {
    name: string;
    quantity: number;
    image: string;
    price: number;
  }[];
  shippingAddress: ShippingAdressType;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt: Date;
  deliveredAt: Date;
};
