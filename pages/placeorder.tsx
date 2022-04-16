import {
    Button,
    Card,
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
    Typography
} from '@material-ui/core';
import React, { useContext, useEffect } from 'react'
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import NextLink from "next/link"
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useStyles from '../utils/styles';
import CheckoutWizard from '../components/CheckoutWizard';

const PlaceOrder = () => {

    const classes = useStyles();

    const router = useRouter();
    const { state } = useContext(Store);
    const { cart: { cartItems, shippingAddress, paymentMethod } } = state;

    const round2 = (num: number) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.456 =? 123.46
    const itemsPrice = round2(cartItems.reduce((a, c) => a + c.price * c.quantity, 0));
    const shippingPrice = itemsPrice > 200 ? 0 : 15;
    const taxPrice = round2(itemsPrice * 0.15);
    const totalPrice = round2(itemsPrice + shippingPrice + taxPrice)

    useEffect(() => {
        if (!paymentMethod) {
            router.push('/payment')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout title='Place Order'>
            <CheckoutWizard activeStep={3} />
            <Typography component="h1" variant="h1">Place Order</Typography>

            <Grid container spacing={1}>
                <Grid item md={9} xs={12}>
                    <Card className={classes.section}>
                        <List>
                            <ListItem>
                                <Typography component='h2' variant='h2' >Shipping Address</Typography>
                            </ListItem>
                            <ListItem>
                                {shippingAddress.fullName}, {shippingAddress.address},{' '}
                                {shippingAddress.city}, {shippingAddress.postalCode},{' '}
                                {shippingAddress.country}
                            </ListItem>
                        </List>
                    </Card>
                    <Card className={classes.section}>
                        <List>
                            <ListItem>
                                <Typography component='h2' variant='h2' >Payment Method</Typography>
                            </ListItem>
                            <ListItem>
                                {paymentMethod}
                            </ListItem>
                        </List>
                    </Card>
                    <Card className={classes.section}>
                        <List>
                            <ListItem>
                                <Typography component='h2' variant='h2' >Order Items</Typography>
                            </ListItem>
                            <ListItem>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Image</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell align='right'>Quantity</TableCell>
                                                <TableCell align='right'>Price</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                cartItems.map((item) => (
                                                    <TableRow key={item._id}>
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
                                                        <TableCell align='right'>
                                                            <Typography>{item.quantity}</Typography>
                                                        </TableCell>
                                                        <TableCell align='right'>
                                                            <Typography>
                                                                $ {item.price}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
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
                                <Typography variant='h2'>
                                    Order Summery
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Typography>Items:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography align='right'>$ {itemsPrice}</Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>
                            <ListItem>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Typography>Tax:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography align='right'>$ {taxPrice}</Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>
                            <ListItem>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Typography>Shipping:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography align='right'>$ {shippingPrice}</Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>
                            <ListItem>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Typography><strong>Total:</strong></Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography align='right'><strong>$ {totalPrice}</strong></Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>
                            <ListItem >
                                <Button fullWidth variant='contained' color='primary'>
                                    Place Order
                                </Button>
                            </ListItem>
                        </List>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    )
}

export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false })