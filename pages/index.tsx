import { NextPage } from "next"
import NextLink from "next/link"
import Layout from "../components/Layout"
import { Grid, Card, CardActionArea, CardMedia, CardContent, Typography, CardActions, Button } from "@material-ui/core"
import data from "../utils/data"

const Home: NextPage = () => {

  return (
    <Layout>
      <div>
        <h1>Proudcts</h1>
        <Grid container spacing={3}>
          {
            data.products.map((product) => (
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

export default Home
