import {
  Typography,
  Grid,
  Card,
  List,
  ListItem,
  Button,
  ListItemText,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useReducer, useState } from "react";
import Layout from "../../../components/Layout";
import { UserType } from "../../../types";
import { getError } from "../../../utils/error";
import { Store } from "../../../utils/Store";
import useStyles from "../../../utils/styles";
import NextLink from "next/link";
import { Controller, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";

export declare type AdminUserActionKind =
  | "FETCH_REQUEST"
  | "FETCH_SUCCESS"
  | "FETCH_FAIL"
  | "UPDATE_REQUEST"
  | "UPDATE_SUCCESS"
  | "UPDATE_FAIL"
  ;

export interface AdminUserAction {
  type: AdminUserActionKind;
  payload?: any;
}

export type AdminUserStateType = {
  loading: boolean;
  error: string;
  loadingUpdate: boolean;
  errorUpdate: string;
  errorUpload: string;
};

const initialUserState: AdminUserStateType = {
  loading: true,
  error: "",
  loadingUpdate: false,
  errorUpdate: "",
  errorUpload: ""
};

function reducer(
  state: AdminUserStateType,
  action: AdminUserAction
): AdminUserStateType {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, errorUpdate: "" };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, errorUpdate: "" };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    default:
      return state;
  }
}

interface UserEditProps {
  params: ParsedUrlQuery | undefined;
}

const UserEdit: React.FC<UserEditProps> = ({ params }) => {
  const userId = params?.id;

  const { state } = useContext(Store);

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(
    reducer,
    initialUserState
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<{name: string, isAdmin: boolean}>();

  const [isAdmin, setIsAdmin] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { userInfo } = state;
  const router = useRouter();

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
      return;
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: "FETCH_REQUEST" });
          const { data } = await axios.get<UserType>(
            `/api/admin/users/${userId}`,
            {
              headers: {
                authorization: `Bearer ${userInfo.token}`,
              },
            }
          );

          setIsAdmin(data.isAdmin);
          dispatch({ type: "FETCH_SUCCESS" });
          setValue("name", data.name);
        } catch (err) {
          dispatch({ type: "FETCH_FAIL", payload: getError(err) });
        }
      };
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classes = useStyles();

  const submitHandler = async ({ name }: { name: string }) => {
    closeSnackbar();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });

      await axios.put(
        `/api/admin/users/${userId}`,
        {
          name,
          isAdmin
        },
        {
          headers: {
            authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar("User updated successfully", {
        variant: "success",
      });
      router.push(`/admin/users`)
    } catch (err: any) {
      dispatch({ type: 'UPDATE_FAIL' });
      enqueueSnackbar(getError(err), {
        variant: "error",
      });
    }
  };

  return (
    <Layout title={`Edit User ${userId}`}>
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
                <ListItem button component="a">
                  <ListItemText primary="Products"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem selected button component="a">
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
                <Typography component="h1" variant="h1">
                  Edit User {userId}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress />}
                {error && (
                  <Typography className={classes.error}>{error}</Typography>
                )}
              </ListItem>
              <ListItem>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="Name"
                            error={Boolean(errors.name)}
                            helperText={errors.name ? "Name is required" : ""}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        label="Is Admin"
                        control={
                          <Checkbox
                            onChange={(e) => setIsAdmin(e.target.checked)}
                            checked={isAdmin}
                            name="isAdmin"
                          />
                        } />
                    </ListItem>
                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                      >
                        Update
                      </Button>
                      {
                        loadingUpdate && <CircularProgress />
                      }
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default dynamic(() => Promise.resolve(UserEdit), { ssr: false });
