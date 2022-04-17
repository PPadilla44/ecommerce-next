import {
  Card,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import React, { useContext, useEffect, useReducer } from "react";
import Layout from "../../components/Layout";
import { Store } from "../../utils/Store";
import NextLink from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import useStyles from "../../utils/styles";
import CheckoutWizard from "../../components/CheckoutWizard";
import { useSnackbar } from "notistack";
import { getError } from "../../utils/error";
import axios from "axios";
import { GetServerSideProps } from "next";
import { OrderType } from "../../types";

export declare type OrderctionKind =
  | "FETCH_REQUEST"
  | "FETCH_SUCCESS"
  | "FETCH_FAIL";

export interface OrderAction {
  type: OrderctionKind;
  payload?: any;
}

export type OrderPageStateType = {
  loading: boolean;
  order: OrderType;
  error: string;
};

const initialOrderState: OrderPageStateType = {
  loading: true,
  order: {} as OrderType,
  error: "",
};

function reducer(
  state: OrderPageStateType,
  action: OrderAction
): OrderPageStateType {
  console.log(action);

  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

interface OrderProps {
  params: {
    id: string;
  };
}

const Order: React.FC<OrderProps> = ({ params }) => {
  const orderId = params.id;
  const classes = useStyles();

  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, order }, dispatch] = useReducer(
    reducer,
    initialOrderState
  );

  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isDelivered,
    isPaid,
    deliveredAt,
    paidAt
  } = order;

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
      return;
    }
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (!order._id || (order._id && order._id !== orderId)) {
      fetchOrder();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const { enqueueSnackbar } = useSnackbar();

  return (
    <Layout title={`Order ${orderId}`}>
      <CheckoutWizard activeStep={3} />
      <Typography component="h1" variant="h1">
        Order {orderId}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography className={classes.error}>{error}</Typography>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography component="h2" variant="h2">
                    Shipping Address
                  </Typography>
                </ListItem>
                <ListItem>
                  {shippingAddress.fullName}, {shippingAddress.address},{" "}
                  {shippingAddress.city}, {shippingAddress.postalCode},{" "}
                  {shippingAddress.country}
                </ListItem>
                <ListItem>
                  Status:{" "}
                  {isDelivered ? `deliveed as ${deliveredAt}` : "not delivered"}
                </ListItem>
              </List>
            </Card>
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography component="h2" variant="h2">
                    Payment Method
                  </Typography>
                </ListItem>
                <ListItem>{paymentMethod}</ListItem>
                <ListItem>
                  Status:{" "}
                  {isPaid ? `deliveed as ${paidAt}` : "not paid"}
                </ListItem>
              </List>
            </Card>
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography component="h2" variant="h2">
                    Order Items
                  </Typography>
                </ListItem>
                <ListItem>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Image</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <NextLink passHref href={`/product/${item.slug}`}>
                                <Link>
                                  <Image
                                    src={`/${item.image}`}
                                    alt={item.name}
                                    width={50}
                                    height={50}
                                  />
                                </Link>
                              </NextLink>
                            </TableCell>
                            <TableCell>
                              <NextLink passHref href={`/product/${item.slug}`}>
                                <Link>
                                  <Typography>{item.name}</Typography>
                                </Link>
                              </NextLink>
                            </TableCell>
                            <TableCell align="right">
                              <Typography>{item.quantity}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography>$ {item.price}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ListItem>
              </List>
            </Card>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography variant="h2">Order Summery</Typography>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Items:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">$ {itemsPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Tax:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">$ {taxPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Shipping:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">$ {shippingPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Total:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">
                        <strong>$ {totalPrice}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default dynamic(() => Promise.resolve(Order), { ssr: false });
