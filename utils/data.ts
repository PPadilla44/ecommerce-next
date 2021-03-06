import { ProductType, UserType } from "../types";
import bcrpyt from "bcryptjs"

const data: { users: UserType[], products: ProductType[] } = {
    users: [
        {
            name: 'John',
            email: 'admin@example.com',
            password: bcrpyt.hashSync('123456'),
            isAdmin: true
        },
        {
            name: 'Jane',
            email: 'user@example.com',
            password: bcrpyt.hashSync('123456'),
            isAdmin: false
        },
    ],
    products: [
        {
            name: "Free Shirt",
            slug: "free-shirt",
            category: "Shirts",
            image: "/images/shirt1.jpg",
            price: 70,
            brand: "Nike",
            rating: 4.5,
            numReviews: 10,
            countInStock: 20,
            description: "A popular shirt",
            isFeatured: true,
            featuredImage: "/images/banner1.jpg",
            reviews: []
        },
        {
            name: "Fit Shirt",
            slug: "fit-shirt",
            category: "Shirts",
            image: "/images/shirt2.jpg",
            price: 80,
            brand: "Addidas",
            rating: 4.2,
            numReviews: 10,
            countInStock: 20,
            description: "A popular shirt",
            isFeatured: true,
            featuredImage: "/images/banner2.jpg",
            reviews: []
        },
        {
            name: "Slim Shirt",
            slug: "slim-shirt",
            category: "Shirts",
            image: "/images/shirt3.jpg",
            price: 70,
            brand: "Raymond",
            rating: 4.5,
            numReviews: 10,
            countInStock: 20,
            description: "A popular shirt",
            reviews: []
        },
        {
            name: "Golf Pants",
            slug: "golf-pants",
            category: "Pants",
            image: "/images/pants1.jpg",
            price: 90,
            brand: "Oliver",
            rating: 4.3,
            numReviews: 10,
            countInStock: 20,
            description: "Smart looking pants",
            reviews: []
        },
        {
            name: "Fit Pants",
            slug: "fit-pants",
            category: "Pants",
            image: "/images/pants2.jpg",
            price: 95,
            brand: "Zara",
            rating: 4.5,
            numReviews: 10,
            countInStock: 20,
            description: "A popular pants",
            reviews: []
        },
        {
            name: "Classic Pants",
            slug: "classic-pants",
            category: "Pants",
            image: "/images/pants3.jpg",
            price: 75,
            brand: "Casely",
            rating: 4.5,
            numReviews: 10,
            countInStock: 20,
            description: "A popular pants",
            reviews: []
        },
    ]
};

export default data;