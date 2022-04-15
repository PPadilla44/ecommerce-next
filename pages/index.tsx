import { NextPage, GetServerSideProps } from "next"
import NextLink from "next/link"
import Layout from "../components/Layout"
import { Grid, Card, CardActionArea, CardMedia, CardContent, Typography, CardActions, Button } from "@material-ui/core"
import db from "../utils/db"
import Product from "../models/Prouct"
import { ProductType } from "../types"
import axios from "axios"
import { useContext } from "react"
import { Store } from "../utils/Store"
import { useRouter } from "next/router"


interface Props {
  products: ProductType[];
}

const Home: NextPage<Props> = ({ products }) => {

  const router = useRouter();
  const { state, dispatch } = useContext(Store);

  const addToCartHandler = async (product: ProductType) => {
    const existItem = state.cart.cartItems.find(x => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get<ProductType>(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch!({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart')
  }

  return (
    <Layout>
      <div>
        <h1>Products</h1>
        <Grid container spacing={3}>
          {
            products.map((product) => (
              <Grid item md={4} key={product.name}>
                <Card>
                  <NextLink href={`/product/${product.slug}`} passHref>
                    <CardActionArea>
                      <CardMedia component={"img"} image={product.image} title={product.name} />
                      <CardContent>
                        <Typography>{product.name}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </NextLink>
                  <CardActions>
                    <Typography>$ {product.price}</Typography>
                    <Button onClick={() => addToCartHandler(product)} size="small" color="primary">Add to cart</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          }
        </Grid>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {

  await db.connect();

  const products = await Product.find({}).lean();

  await db.disconnect();

  return {
    props: {
      products: products.map(db.covertDocToObj)
    }
  }
}

export default Home
