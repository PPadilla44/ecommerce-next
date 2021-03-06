import {
  Button,
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
import { useSnackbar } from "notistack";
import { getError } from "../../utils/error";
import axios from "axios";
import { GetServerSideProps } from "next";
import { OrderType } from "../../types";
import {
  PayPalButtons,
  SCRIPT_LOADING_STATE,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

export declare type OrderActionKind =
  | "FETCH_REQUEST"
  | "FETCH_SUCCESS"
  | "FETCH_FAIL"
  | "PAY_REQUEST"
  | "PAY_SUCCESS"
  | "PAY_FAIL"
  | "PAY_RESET"
  | "DELIVER_REQUEST"
  | "DELIVER_SUCCESS"
  | "DELIVER_FAIL"
  | "DELIVER_RESET"
  ;

export interface OrderAction {
  type: OrderActionKind;
  payload?: any;
}

export type OrderPageStateType = {
  loading: boolean;
  loadingPay: boolean;
  successPay: boolean;
  loadingDeliver: boolean;
  successDeliver: boolean;
  order: OrderType;
  error: string;
  errorPay: string;
  errorDeliver: string;
};

const initialOrderState: OrderPageStateType = {
  loading: true,
  loadingPay: false,
  successPay: false,
  loadingDeliver: false,
  successDeliver: false,
  order: {} as OrderType,
  error: "",
  errorPay: "",
  errorDeliver: ""
};

function reducer(
  state: OrderPageStateType,
  action: OrderAction
): OrderPageStateType {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false, errorPay: action.payload };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false, errorPay: '' };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    case 'DELIVER_RESET':
      return { ...state, loadingDeliver: false, successDeliver: false, errorDeliver: '' };
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
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const classes = useStyles();

  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, order, successPay, loadingDeliver, successDeliver }, dispatch] = useReducer(
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
    paidAt,
  } = order;

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
      return;
    }
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get<OrderType>(`/api/orders/${orderId}`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (!order._id || successPay || successDeliver || (order._id && order._id !== orderId)) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' })
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' })
      }
    } else {
      const loadPayPalScript = async () => {
        const { data: clientId } = await axios.get(`/api/keys/paypal`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": clientId,
            currency: "USD",
          },
        });
        //ts-ignore
        paypalDispatch({ type: "setLoadingStatus", value: SCRIPT_LOADING_STATE['PENDING'] });
      };
      loadPayPalScript();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, successPay, successDeliver]);

  const { enqueueSnackbar } = useSnackbar();


  const onError = (err: Record<string, unknown>) => {
    enqueueSnackbar(getError(err), {
      variant: "error",
    });
  };

  const deliverOrderHanlder = async () => {
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      const { data } = await axios.put<OrderType>(`/api/orders/${order._id}/deliver`, {

      },
        {
          headers: {
            authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      enqueueSnackbar('Order is delivered', { variant: 'success' })
    } catch (err) {
      dispatch({ type: "DELIVER_FAIL", payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: 'error' })
    }
  }

  return (
    <Layout title={`Order ${orderId}`}>
      <>
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
                    {isDelivered ? `delivered at ${deliveredAt}` : "not delivered"}
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
                    Status: {isPaid ? `paid at ${paidAt}` : "not paid"}
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
                            <TableRow key={item._id as string}>
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
                  {!isPaid && (
                    <ListItem>
                      {isPending ? (
                        <CircularProgress />
                      ) : (
                        <div className={classes.fullWidth}>
                          <PayPalButtons
                            createOrder={(data, actions) => {
                              return actions.order
                                .create({
                                  purchase_units: [
                                    {
                                      amount: { value: `${totalPrice}` },
                                    },
                                  ],
                                })
                                .then((orderID: any) => {
                                  return orderID;
                                });
                            }}
                            onApprove={(data, actions) => {
                              return actions
                                .order!.capture()
                                .then(async function (details) {
                                  try {
                                    dispatch({ type: "PAY_REQUEST" });
                                    const { data } = await axios.put(
                                      `/api/orders/${order._id}/pay`,
                                      details,
                                      {
                                        headers: {
                                          authorization: `Bearer ${userInfo?.token}`
                                        }
                                      }
                                    );
                                    dispatch({
                                      type: "PAY_SUCCESS",
                                      payload: data,
                                    });
                                    enqueueSnackbar("Order is paid", {
                                      variant: "success",
                                    });
                                  } catch (err) {
                                    dispatch({
                                      type: "PAY_FAIL",
                                      payload: getError(err),
                                    });
                                    enqueueSnackbar(getError(err), {
                                      variant: "error",
                                    });
                                  }
                                });
                            }}
                            onError={onError}
                          ></PayPalButtons>
                        </div>
                      )}
                    </ListItem>
                  )}
                  {
                    userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
                      <ListItem>
                        {
                          loadingDeliver && <CircularProgress />
                        }
                        <Button fullWidth variant="contained" color="primary" onClick={deliverOrderHanlder} >Deliver Order</Button>
                      </ListItem>
                    )
                  }
                </List>
              </Card>
            </Grid>
          </Grid>
        )}
      </>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default dynamic(() => Promise.resolve(Order), { ssr: false });
