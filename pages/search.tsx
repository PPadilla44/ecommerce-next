import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import Layout from "../components/Layout";
import Product from "../models/Product";
import { FilterSearchType, ProductType } from "../types";
import db from "../utils/db";
import useStyles from "../utils/styles";
import { LeanDocument } from "mongoose";
import ProductItem from "../components/ProductItem";
import { Store } from "../utils/Store";
import axios from "axios";
import { Cancel } from "@material-ui/icons";
import { Pagination, Rating } from "@material-ui/lab";

const PAGE_SIZE = 3;

const prices = [
  {
    name: "$1 to $50",
    value: "1-50",
  },
  {
    name: "$51 to $200",
    value: "51-200",
  },
  {
    name: "$201 to $1000",
    value: "201-100",
  },
];

const ratings = [1, 2, 3, 4, 5];

interface SearchProps {
  products: LeanDocument<ProductType>[];
  countProducts: number;
  categories: ProductType["category"][];
  brands: ProductType["brand"][];
  pages: number;
}

const Search: React.FC<SearchProps> = ({
  products,
  countProducts,
  categories,
  brands,
  pages,
}) => {
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);

  const {
    query = "all",
    category = "all",
    brand = "all",
    price = "all",
    rating = "all",
    sort = "featured",
    page
  } = router.query;

  const filterSearch = (data: FilterSearchType) => {
    const path = router.pathname;
    const { query } = router;
    if (data.page) query.page = `${data.page}`;
    if (data.searchQuery) query.searchQuery = data.searchQuery;
    if (data.sort) query.sort = data.sort;
    if (data.category) query.category = data.category;
    if (data.brand) query.brand = data.brand;
    if (data.price) query.price = `${data.price}`;
    if (data.rating) query.rating = `${data.rating}`;
    if (data.min)
      query.min ? query.min : query.min === "0" ? "0" : `${data.min}`;
    if (data.max)
      query.max ? query.max : query.max === "0" ? "0" : `${data.max}`;
    router.push({
      pathname: path,
      query: query,
    });
  };

  const addToCartHandler = async (product: ProductType) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get<ProductType>(
      `/api/products/${product._id}`
    );
    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }
    dispatch!({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };

  return (
    <Layout title="Search">
      <>
        <Grid className={classes.mt1} container spacing={1}>
          <Grid item md={3}>
            <List>
              <ListItem>
                <Box className={classes.fullWidth}>
                  <Typography>Categories</Typography>
                  <Select
                    fullWidth
                    value={category}
                    onChange={(e) =>
                      filterSearch({ category: e.target.value as string })
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    {categories &&
                      categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                  </Select>
                </Box>
              </ListItem>
              <ListItem>
                <Box className={classes.fullWidth}>
                  <Typography>Brands</Typography>
                  <Select
                    fullWidth
                    value={brand}
                    onChange={(e) =>
                      filterSearch({ brand: e.target.value as string })
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    {brands &&
                      brands.map((brand) => (
                        <MenuItem key={brand} value={brand}>
                          {brand}
                        </MenuItem>
                      ))}
                  </Select>
                </Box>
              </ListItem>
              <ListItem>
                <Box className={classes.fullWidth}>
                  <Typography>Prices</Typography>
                  <Select
                    fullWidth
                    value={price}
                    onChange={(e) =>
                      filterSearch({ price: e.target.value as string })
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    {prices.map((price) => (
                        <MenuItem key={price.value} value={price.value}>
                          {price.name}
                        </MenuItem>
                      ))}
                  </Select>
                </Box>
              </ListItem>
              <ListItem>
                <Box className={classes.fullWidth}>
                  <Typography>Ratings</Typography>
                  <Select
                    fullWidth
                    value={rating}
                    onChange={(e) =>
                      filterSearch({ rating: e.target.value as string })
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    {ratings.map((rating) => (
                        <MenuItem key={rating} value={`${rating}`}>
                          <Rating value={rating} readOnly />
                          <Typography component={"span"}>{`& Up`}</Typography>
                        </MenuItem>
                      ))}
                  </Select>
                </Box>
              </ListItem>
            </List>
          </Grid>
          <Grid item md={9}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                {products.length === 0 ? "No" : countProducts} Results
                {query !== "all" && query !== "" && " : " + query}
                {category !== "all" && " : " + category}
                {brand !== "all" && " : " + brand}
                {price !== "all" && " : Price " + price}
                {rating !== "all" && " : Rating " + rating + " & up"}
                {(query !== "all" && query !== "") ||
                category !== "all" ||
                brand !== "all" ||
                rating !== "all" ||
                price !== "all" ? (
                  <Button onClick={() => router.push("/search")}>
                    <Cancel />
                  </Button>
                ) : null}
              </Grid>
              <Grid item>
                <Typography component={"span"} className={classes.sort}>
                  Sort by
                </Typography>
                <Select
                  value={sort}
                  onChange={(e) =>
                    filterSearch({ sort: e.target.value as string })
                  }
                >
                  <MenuItem value="featured">Featured</MenuItem>
                  <MenuItem value="lowest">Price: Low to High</MenuItem>
                  <MenuItem value="highest">Price: High to Low</MenuItem>
                  <MenuItem value="toprated">Customer Reviews</MenuItem>
                  <MenuItem value="newest">NewestArrivals</MenuItem>
                </Select>
              </Grid>
            </Grid>
            <Grid className={classes.mt1} container spacing={3}>
              {products.map((product) => (
                <Grid item md={4} key={product.name}>
                  <ProductItem
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                </Grid>
              ))}
            </Grid>
            <Pagination
            className={classes.mt1}
            defaultPage={parseInt(page as string || "1")}
            count={pages}
            onChange={(e, page) => filterSearch({ page })}
            />
          </Grid>
        </Grid>
      </>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  await db.connect();
  const pageSize = Number(query.pageSize) || PAGE_SIZE;
  const page = Number(query.page) || 1;
  const category = query.category || "";
  const brand = query.brand || "";
  const price = query.price || "";
  const rating = query.rating || "";
  const sort = query.sort || "";
  const searchQuery = query.searchQuery || "";

  const queryFilter =
    searchQuery && searchQuery !== "all"
      ? {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        }
      : {};
  const categoryFilter = category && category !== "all" ? { category } : {};
  const brandFilter = brand && brand !== "all" ? { brand } : {};
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};
  const priceFilter =
    price && price !== "all"
      ? {
          price: {
            $gte: Number((price as string).split("-")[0]),
            $lte: Number((price as string).split("-")[1]),
          },
        }
      : {};

  const order =
    sort === "featured"
      ? { featured: -1 }
      : sort === "lowest"
      ? { price: 1 }
      : sort === "highest"
      ? { price: -1 }
      : sort === "toprated"
      ? { rating: -1 }
      : sort === "newest"
      ? { createdAt: -1 }
      : { _id: -1 };

  const categories = await Product.find().distinct("category");
  const brands = await Product.find().distinct("brand");
  const productDocs = await Product.find(
    {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    },
    "-reviews"
  )
    .sort(order)
    .skip(Number(pageSize) * (Number(page) - 1))
    .limit(Number(pageSize))
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter,
  });

  await db.disconnect();

  const products = productDocs.map(db.covertDocToObj);

  return {
    props: {
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
      categories,
      brands,
    },
  };
};

export default Search;
