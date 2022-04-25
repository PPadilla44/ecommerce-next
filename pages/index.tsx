/* eslint-disable @next/next/no-img-element */
import { NextPage, GetServerSideProps } from "next";
import Layout from "../components/Layout";
import { Grid, Typography, Link } from "@material-ui/core";
import db from "../utils/db";
import Product from "../models/Product";
import { ProductType } from "../types";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../utils/Store";
import { useRouter } from "next/router";
import ProductItem from "../components/ProductItem";
import useStyles from "../utils/styles";
import Carousel from "react-material-ui-carousel";
import NextLink from "next/link";

interface Props {
  featuredProducts: ProductType[];
  topRatedProducts: ProductType[];
}

const Home: NextPage<Props> = ({ featuredProducts, topRatedProducts }) => {
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);

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
    <Layout>
      <>
        <Carousel className={classes.mt1} animation="slide">
          {featuredProducts.map((product) => (
            <NextLink
              key={product._id as string}
              href={`/product/${product.slug}`}
              passHref
            >
              <Link>
                <img
                  src={product.featuredImage}
                  alt={product.name}
                  style={{  width: "100%", height: 300, objectFit: 'cover', objectPosition: 'top' }}
                />
              </Link>
            </NextLink>
          ))}
        </Carousel>
        <Typography variant="h2">Popular Products</Typography>
        <Grid container spacing={3}>
          {topRatedProducts.map((product) => (
            <Grid item md={4} key={product.name}>
              <ProductItem
                product={product}
                addToCartHandler={addToCartHandler}
              />
            </Grid>
          ))}
        </Grid>
      </>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  await db.connect();

  const topRatedProductsDocs = await Product.find({}, "-reviews")
    .lean()
    .sort({
      rating: -1,
    })
    .limit(6);

  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    "-reviews"
  )
    .lean()
    .limit(3);

  await db.disconnect();

  return {
    props: {
      featuredProducts: featuredProductsDocs.map(db.covertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.covertDocToObj),
    },
  };
};

export default Home;
