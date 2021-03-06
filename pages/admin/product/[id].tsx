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
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useReducer, useState } from "react";
import Layout from "../../../components/Layout";
import { ProductForm, ProductType } from "../../../types";
import { getError } from "../../../utils/error";
import { Store } from "../../../utils/Store";
import useStyles from "../../../utils/styles";
import NextLink from "next/link";
import { Controller, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

export declare type AdminProductActionKind =
  | "FETCH_REQUEST"
  | "FETCH_SUCCESS"
  | "FETCH_FAIL"
  | "UPDATE_REQUEST"
  | "UPDATE_SUCCESS"
  | "UPDATE_FAIL"
  | "UPLOAD_REQUEST"
  | "UPLOAD_SUCCESS"
  | "UPLOAD_FAIL";

export interface AdminProductAction {
  type: AdminProductActionKind;
  payload?: any;
}

export type AdminProductStateType = {
  loading: boolean;
  error: string;
  loadingUpdate: boolean;
  errorUpdate: string;
  loadingUpload: boolean;
  errorUpload: string;
};

const initialProductState: AdminProductStateType = {
  loading: true,
  error: "",
  loadingUpdate: false,
  errorUpdate: "",
  loadingUpload: false,
  errorUpload: "",
};

function reducer(
  state: AdminProductStateType,
  action: AdminProductAction
): AdminProductStateType {
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
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return { ...state, loadingUpload: false, errorUpload: "" };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
}

interface ProductEditProps {
  params: ParsedUrlQuery | undefined;
}

const ProductEdit: React.FC<ProductEditProps> = ({ params }) => {
  const productId = params?.id;

  const { state } = useContext(Store);

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, initialProductState);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<ProductForm>();

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
          const { data } = await axios.get<ProductType>(
            `/api/admin/products/${productId}`,
            {
              headers: {
                authorization: `Bearer ${userInfo.token}`,
              },
            }
          );
          dispatch({ type: "FETCH_SUCCESS" });

          setValue("name", data.name);
          setValue("slug", data.slug);
          setValue("price", data.price);
          setValue("image", data.image);
          setValue("featuredImage", data.featuredImage);
          setIsFeatured(data?.isFeatured || false);
          setValue("category", data.category);
          setValue("brand", data.brand);
          setValue("countInStock", data.countInStock);
          setValue("description", data.description);
        } catch (err) {
          dispatch({ type: "FETCH_FAIL", payload: getError(err) });
        }
      };
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classes = useStyles();
  const [isFeatured, setIsFeatured] = useState(false);

  const uploadHandler = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageField: "image" | "featuredImage" = "image"
  ) => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];

    const bodyFormData = new FormData();
    bodyFormData.append("file", file);

    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post<
        UploadApiResponse | UploadApiErrorResponse
      >(`/api/admin/upload`, bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${userInfo?.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });
      setValue(imageField, data.secure_url as string);
      enqueueSnackbar("File Uploaded Successfully", { variant: "success" });
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

  const submitHandler = async (productData: ProductForm) => {
    closeSnackbar();

    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `/api/admin/products/${productId}`,
        {
          ...productData,
          isFeatured: isFeatured,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      enqueueSnackbar("Product updated successfully", {
        variant: "success",
      });
      router.push(`/admin/products`);
    } catch (err: any) {
      dispatch({ type: "UPDATE_FAIL" });
      enqueueSnackbar(getError(err), {
        variant: "error",
      });
    }
  };

  return (
    <Layout title={`Edit Product ${productId}`}>
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
                <Typography component="h1" variant="h1">
                  Edit Product {productId}
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
                      <Controller
                        name="slug"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="slug"
                            label="Slug"
                            error={Boolean(errors.slug)}
                            helperText={errors.slug ? "Slug is required" : ""}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="price"
                        control={control}
                        defaultValue={0}
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="price"
                            type="number"
                            label="Price"
                            error={Boolean(errors.price)}
                            helperText={errors.price ? "Price is required" : ""}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="image"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="image"
                            label="Image"
                            error={Boolean(errors.image)}
                            helperText={errors.image ? "Image is required" : ""}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Button variant="contained" component="label">
                        Upload File
                        <input type="file" onChange={uploadHandler} hidden />
                      </Button>
                      {loadingUpload && <CircularProgress />}
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        label="Is Featured"
                        control={
                          <Checkbox
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            checked={isFeatured}
                            name="isFeatured"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="featuredImage"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="featuredImage"
                            label="Featured Image"
                            error={Boolean(errors.featuredImage)}
                            helperText={
                              errors.featuredImage
                                ? "Featured Image is required"
                                : ""
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Button variant="contained" component="label">
                        Upload File
                        <input
                          type="file"
                          onChange={(e) => uploadHandler(e, "featuredImage")}
                          hidden
                        />
                      </Button>
                      {loadingUpload && <CircularProgress />}
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="category"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="category"
                            label="Category"
                            error={Boolean(errors.category)}
                            helperText={
                              errors.category ? "Category is required" : ""
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="brand"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="brand"
                            label="Brand"
                            error={Boolean(errors.brand)}
                            helperText={errors.brand ? "Brand is required" : ""}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="countInStock"
                        control={control}
                        defaultValue={0}
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="countInStock"
                            type="number"
                            label="Count in stock"
                            error={Boolean(errors.countInStock)}
                            helperText={
                              errors.countInStock
                                ? "Count in stock is required"
                                : ""
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            multiline
                            id="description"
                            label="Description"
                            error={Boolean(errors.description)}
                            helperText={
                              errors.description
                                ? "Description is required"
                                : ""
                            }
                            {...field}
                          />
                        )}
                      />
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
                      {loadingUpdate && <CircularProgress />}
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

export default dynamic(() => Promise.resolve(ProductEdit), { ssr: false });
