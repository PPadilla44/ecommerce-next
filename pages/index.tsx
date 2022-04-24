import { NextPage, GetServerSideProps } from "next";
import Layout from "../components/Layout";
import { Grid } from "@material-ui/core";
import db from "../utils/db";
import Product from "../models/Product";
import { ProductType } from "../types";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../utils/Store";
import { useRouter } from "next/router";
import ProductItem from "../components/ProductItem";

interface Props {
  products: ProductType[];
}

const Home: NextPage<Props> = ({ products }) => {
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
      <div>
        <h1>Products</h1>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item md={4} key={product.name}>
              <ProductItem
                product={product}
                addToCartHandler={addToCartHandler}
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  await db.connect();

  const products = await Product.find({}, "-reviews").lean();

  await db.disconnect();

  return {
    props: {
      products: products.map(db.covertDocToObj),
    },
  };
};

export default Home;
