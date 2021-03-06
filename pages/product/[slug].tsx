import { GetServerSideProps } from "next";
import React, { useContext, useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Link,
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import Layout from "../../components/Layout";
import useStyles from "../../utils/styles";
import Image from "next/image";
import db from "../../utils/db";
import Product from "../../models/Product";
import { ProductType, ReviewType } from "../../types";
import axios from "axios";
import { Store } from "../../utils/Store";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { getError } from "../../utils/error";

interface Props {
  product: ProductType;
}

const ProductScreen: React.FC<Props> = ({ product }) => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );
      setLoading(false);
      enqueueSnackbar("Review submitted successfully", { variant: "success" });
      fetchReviews();
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get<ReviewType[]>(
        `/api/products/${product._id}/reviews`
      );
      setReviews(data);
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

  useEffect(() => {
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!product) {
    return <div>Product Not Found</div>;
  }

  const addToCartHandler = async () => {
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
    <Layout title={product.name} description={product.description}>
      <>
        <div className={classes.section}>
          <NextLink href={"/"} passHref>
            <Link>
              <Typography>back to products</Typography>
            </Link>
          </NextLink>
        </div>
        <Grid container spacing={1}>
          <Grid item md={6} xs={12}>
            <Image
              src={product.image}
              alt={product.name}
              width={640}
              height={642}
              layout={"responsive"}
            />
          </Grid>
          <Grid item md={3} xs={12}>
            <List>
              <ListItem>
                <Typography component={"h1"} variant="h1">
                  {product.name}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>Category: {product.category}</Typography>
              </ListItem>
              <ListItem>
                <Typography> Brand: {product.brand}</Typography>
              </ListItem>
              <ListItem>
                <Rating value={product.rating} readOnly></Rating>
                <Link href="#reviews">
                  <Typography>({product.numReviews} reviews)</Typography>
                </Link>
              </ListItem>
              <ListItem>
                <Typography>Description: {product.description}</Typography>
              </ListItem>
            </List>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card>
              <List>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Price</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>$ {product.price}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Status</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>
                        {product.countInStock > 0 ? "In stock" : "Unavailable"}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={addToCartHandler}
                  >
                    Add to cart
                  </Button>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
        <List>
          <ListItem>
            <Typography variant="h2">Customer Reviews</Typography>
          </ListItem>
          {reviews.length === 0 && <ListItem>No reviews</ListItem>}
          {reviews.map((review) => (
            <ListItem key={review._id as string}>
              <Grid container>
                <Grid item className={classes.reviewItem}>
                  <Typography variant="h2">
                    <strong>{review.name}</strong>
                  </Typography>
                  <p>{review.createdAt?.substring(0, 10)}</p>
                </Grid>
                <Grid item>
                  <Rating value={review.rating} readOnly />
                  <Typography>
                    <p>{review.comment}</p>
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))}
          <ListItem>
            {userInfo ? (
              <form onSubmit={submitHandler} className={classes.reviewForm}>
                <List>
                  <ListItem>
                    <Typography variant="h2">Leave your review</Typography>
                  </ListItem>
                  <ListItem>
                    <TextField
                      multiline
                      variant="outlined"
                      fullWidth
                      name="review"
                      label="Enter comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </ListItem>
                  <ListItem>
                    <Rating
                      name="simple-controlled"
                      value={rating}
                      onChange={(e, value) => setRating(value as number)}
                    />
                  </ListItem>
                  <ListItem>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                    >
                      Submit
                    </Button>
                    {loading && <CircularProgress />}
                  </ListItem>
                </List>
              </form>
            ) : (
              <Typography variant="h2">
                Please{" "}
                <Link href={`/login?redirect=/product/${product.slug}`}>
                  login
                </Link>{" "}
                to write a review
              </Typography>
            )}
          </ListItem>
        </List>
      </>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  const slug = params?.slug;

  await db.connect();

  const product = await Product.findOne({ slug }, "-reviews").lean();

  await db.disconnect();

  if (product) {
    return {
      props: {
        product: db.covertDocToObj(product),
      },
    };
  }

  return {
    props: {
      prduct: {},
    },
  };
};

export default ProductScreen;
