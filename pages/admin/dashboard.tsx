import {
  Typography,
  CircularProgress,
  Grid,
  Card,
  List,
  ListItem,
  Button,
  ListItemText,
  CardContent,
  CardActions,
} from "@material-ui/core";
import { Bar } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"

import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useReducer } from "react";
import Layout from "../../components/Layout";
import { OrderType } from "../../types";
import { getError } from "../../utils/error";
import { Store } from "../../utils/Store";
import useStyles from "../../utils/styles";
import NextLink from 'next/link'

export declare type AdminDashboardActionKind =
  | "FETCH_REQUEST"
  | "FETCH_SUCCESS"
  | "FETCH_FAIL";

export interface AdminDashboardAction {
  type: AdminDashboardActionKind;
  payload?: any;
}

export type AdminDashboardStateType = {
  loading: boolean;
  summary: {
    salesData: { _id: string; totalSales: number; }[];
    ordersCount: number;
    productsCount: number;
    usersCount: number;
    ordersPrice: number;
  };
  error: string;
};

const initialOrderState: AdminDashboardStateType = {
  loading: true,
  summary: {
    salesData: [],
    ordersCount: 0,
    ordersPrice: 0,
    productsCount: 0,
    usersCount: 0
  },
  error: "",
};

function reducer(
  state: AdminDashboardStateType,
  action: AdminDashboardAction
): AdminDashboardStateType {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, summary: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

const AdminDashboard = () => {
  Chart.register(...registerables)
  const { state } = useContext(Store);
  const { userInfo } = state;
  const router = useRouter();

  const [{ loading, error, summary }, dispatch] = useReducer(
    reducer,
    initialOrderState
  );


  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
      return;
    }
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get<OrderType[]>(`/api/admin/summary`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classes = useStyles();

  return (
    <Layout title={`Order History`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Admin Dashboard"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Orders"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Products"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Users"></ListItemText>
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>

              <ListItem>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography className={classes.error}>{error}</Typography>
                ) : (
                  <Grid container spacing={5}>
                    <Grid item md={3}>
                      <Card raised>
                        <CardContent>
                          <Typography variant="h1" >$ {summary.ordersPrice}</Typography>
                          <Typography>Sales</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href={`/admin/orders`} passHref>
                            <Button size="small" color="primary">View Sales</Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card raised>
                        <CardContent>
                          <Typography variant="h1" >{summary.ordersCount}</Typography>
                          <Typography>Orders</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href={`/admin/orders`} passHref>
                            <Button size="small" color="primary">View Orders</Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card raised>
                        <CardContent>
                          <Typography variant="h1" >{summary.productsCount}</Typography>
                          <Typography>Products</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href={`/admin/products`} passHref>
                            <Button size="small" color="primary">View Products</Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card raised>
                        <CardContent>
                          <Typography variant="h1" >{summary.usersCount}</Typography>
                          <Typography>Users</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href={`/admin/users`} passHref>
                            <Button size="small" color="primary">View Users</Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </ListItem>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Sales Chart
                </Typography>
              </ListItem>
              <ListItem>
                <Bar data={{
                  labels: summary.salesData.map((x) => x._id),
                  datasets: [
                    {
                      label: 'Sales',
                      backgroundColor: 'rgba(162, 222, 208, 1)',
                      data: summary.salesData.map((x) => x.totalSales)
                    }
                  ]
                }}
                />
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(AdminDashboard), { ssr: false });
