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
}

export type UserType = {
    _id?: string;
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type ShippingAdressType = {
    fullName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
}