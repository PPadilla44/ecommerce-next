import {
  Typography,
  CircularProgress,
  Grid,
  Card,
  List,
  ListItem,
  Button,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useReducer } from "react";
import Layout from "../../components/Layout";
import { ProductType } from "../../types";
import { getError } from "../../utils/error";
import { Store } from "../../utils/Store";
import useStyles from "../../utils/styles";
import NextLink from 'next/link'
import { useSnackbar } from "notistack";

export declare type AdminProductsActionKind =
  | "FETCH_REQUEST"
  | "FETCH_SUCCESS"
  | "FETCH_FAIL"
  | "CREATE_REQUEST"
  | "CREATE_SUCCESS"
  | "CREATE_FAIL"
  ;

export interface AdminProductsAction {
  type: AdminProductsActionKind;
  payload?: any;
}

export type AdminProductsStateType = {
  loading: boolean;
  loadingCreate: boolean;
  products: ProductType[];
  error: string;
};

const initialProductState: AdminProductsStateType = {
  loading: true,
  loadingCreate: false,
  products: [],
  error: "",
};

function reducer(
  state: AdminProductsStateType,
  action: AdminProductsAction
): AdminProductsStateType {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, products: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "CREATE_REQUEST":
      return { ...state, loadingCreate: true, error: "" };
    case "CREATE_SUCCESS":
      return { ...state, loadingCreate: false, products: action.payload, error: "" };
    case "CREATE_FAIL":
      return { ...state, loadingCreate: false, error: action.payload };
    default:
      return state;
  }
}

const AdminProducts = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const router = useRouter();

  const [{ loading, error, products, loadingCreate }, dispatch] = useReducer(
    reducer,
    initialProductState
  );


  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
      return;
    }
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get<ProductType[]>(`/api/admin/products`, {
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
  }, []);

  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const createHandler = async () => {
    if(!window.confirm('Are you sure')) {
      return;
    }

    try {
      dispatch({ type: 'CREATE_REQUEST' })
      const { data } = await axios.post<{ product: ProductType}>(`/api/admin/products`, {

      },{
        headers: {
          authorization: `Bearer ${userInfo?.token}`
        }
      })
      dispatch({ type: 'CREATE_SUCCESS' });
      enqueueSnackbar('Product created successfully', { variant: 'success' })
      router.push(`/admin/product/${data.product._id}`)
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL', payload: getError(err) })
      enqueueSnackbar(getError(err), { variant: 'error' })
    }
  }

  return (
    <Layout title={`Product History`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Admin Dashboard"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Orders"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Products"></ListItemText>
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Grid alignItems="center" container>
                  <Grid item xs={6}>
                    <Typography component="h1" variant="h1">
                      Products
                    </Typography>
                  </Grid>
                  <Grid style={{ backgroundColor: 'red' }} item xs={6}>
                    <Button onClick={createHandler} color="primary" variant="contained">
                      Create
                    </Button>
                    { loadingCreate && <CircularProgress /> }
                  </Grid>
                </Grid>
              </ListItem>

              <ListItem>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography className={classes.error}>{error}</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>NAME</TableCell>
                          <TableCell>PRICE</TableCell>
                          <TableCell>CATEGORY</TableCell>
                          <TableCell>COUNT</TableCell>
                          <TableCell>RATING</TableCell>
                          <TableCell>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              {product._id?.substring(20, 24)}
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>$ {product.price}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.countInStock}</TableCell>
                            <TableCell>{product.rating}</TableCell>
                            <TableCell>
                              <NextLink href={`/admin/product/${product._id}`} passHref>
                                <Button size="small" variant="contained" >Edit</Button>
                              </NextLink>{` `}
                              <Button size="small" variant="contained" >Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </ListItem>

            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(AdminProducts), { ssr: false });
