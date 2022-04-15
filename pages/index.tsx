import { NextPage, GetServerSideProps } from "next"
import NextLink from "next/link"
import Layout from "../components/Layout"
import { Grid, Card, CardActionArea, CardMedia, CardContent, Typography, CardActions, Button } from "@material-ui/core"
import db from "../utils/db"
import Product from "../models/Prouct"
import { ProductType } from "../types"

interface Props {
  products: ProductType[];
}

const Home: NextPage<Props> = ({ products }) => {


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
                    <Button size="small" color="primary">Add to card</Button>
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
