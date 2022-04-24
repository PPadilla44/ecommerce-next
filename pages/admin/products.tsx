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
import NextLink from "next/link";
import { useSnackbar } from "notistack";

export declare type AdminProductsActionKind =
  | "FETCH_REQUEST"
  | "FETCH_SUCCESS"
  | "FETCH_FAIL"
  | "CREATE_REQUEST"
  | "CREATE_SUCCESS"
  | "CREATE_FAIL"
  | "DELETE_REQUEST"
  | "DELETE_SUCCESS"
  | "DELETE_FAIL"
  | "DELETE_RESET";

export interface AdminProductsAction {
  type: AdminProductsActionKind;
  payload?: any;
}

export type AdminProductsStateType = {
  loading: boolean;
  loadingCreate: boolean;
  loadingDelete: boolean;
  successDelete: boolean;
  products: ProductType[];
  error: string;
};

const initialProductState: AdminProductsStateType = {
  loading: true,
  loadingCreate: false,
  loadingDelete: false,
  successDelete: true,
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
      return { ...state, loadingCreate: false, error: "" };
    case "CREATE_FAIL":
      return { ...state, loadingCreate: false, error: action.payload };
    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, error: "" };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, error: "", successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false, error: action.payload };
    case "DELETE_RESET":
      return {
        ...state,
        loadingDelete: false,
        error: action.payload,
        successDelete: false,
      };
    default:
      return state;
  }
}

const AdminProducts = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const router = useRouter();

  const [
    { loading, error, products, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, initialProductState);

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
    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successDelete]);

  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const createHandler = async () => {
    if (!window.confirm("Are you sure")) {
      return;
    }

    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await axios.post<{ product: ProductType }>(
        `/api/admin/products`,
        {},
        {
          headers: {
            authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );
      dispatch({ type: "CREATE_SUCCESS" });
      enqueueSnackbar("Product created successfully", { variant: "success" });
      router.push(`/admin/product/${data.product._id}`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL", payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

  const deleteHandler = async (productId: string) => {
    if (!window.confirm("Are you sure?")) {
      return;
    }

    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/products/${productId}`, {
        headers: {
          authorization: `Bearer ${userInfo?.token}`,
        },
      });
      dispatch({ type: "DELETE_SUCCESS" });
      enqueueSnackbar("Product deleted successfully", { variant: "success" });
    } catch (err) {
      dispatch({ type: "DELETE_FAIL", payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

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
                <Grid alignItems="center" container>
                  <Grid item xs={6}>
                    <Typography component="h1" variant="h1">
                      Products
                    </Typography>
                    {loadingDelete && <CircularProgress />}
                  </Grid>
                  {/* disable ts */}
                  <Grid item xs={6} style={{ display: "flex" }} justifyContent="flex-end">
                    <Button
                      onClick={createHandler}
                      color="primary"
                      variant="contained"
                    >
                      Create
                    </Button>
                    {loadingCreate && <CircularProgress />}
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
                          <TableRow key={product._id as string}>
                            <TableCell>
                              {(product._id as string)?.substring(20, 24)}
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>$ {product.price}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.countInStock}</TableCell>
                            <TableCell>{product.rating}</TableCell>
                            <TableCell>
                              <NextLink
                                href={`/admin/product/${product._id}`}
                                passHref
                              >
                                <Button size="small" variant="contained">
                                  Edit
                                </Button>
                              </NextLink>
                              {` `}
                              <Button
                                onClick={() => deleteHandler(product._id as string)}
                                size="small"
                                variant="contained"
                              >
                                Delete
                              </Button>
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
