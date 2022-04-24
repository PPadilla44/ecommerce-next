import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import React from "react";
import { ProductType } from "../types";
import NextLink from "next/link";


export interface ProductItemProps {
  product: ProductType;
  // eslint-disable-next-line no-unused-vars
  addToCartHandler: (product: ProductType) => Promise<void>;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, addToCartHandler }) => {
  return (
    <Card>
      <NextLink href={`/product/${product.slug}`} passHref>
        <CardActionArea>
          <CardMedia
            component={"img"}
            image={product.image}
            title={product.name}
          />
          <CardContent>
            <Typography>{product.name}</Typography>
            <Rating value={product.rating} readOnly></Rating>
          </CardContent>
        </CardActionArea>
      </NextLink>
      <CardActions>
        <Typography>$ {product.price}</Typography>
        <Button
          onClick={() => addToCartHandler(product)}
          size="small"
          color="primary"
        >
          Add to cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductItem;
