import { Button, List, ListItem, TextField, Typography } from '@material-ui/core'
import React, { useContext, useEffect } from 'react'
import Layout from '../components/Layout'
import useStyles from '../utils/styles'
import { Store } from '../utils/Store'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { Controller, useForm } from 'react-hook-form'
import { ShippingAdressType } from '../types'
import CheckoutWizard from '../components/CheckoutWizard'

const Shippping = () => {
    const router = useRouter();
    const { state, dispatch } = useContext(Store);
    const { userInfo, cart: { shippingAddress } } = state;
    const { handleSubmit, control, formState: { errors }, setValue } = useForm<ShippingAdressType>();

    useEffect(() => {
        if (!userInfo) {
            router.push('/login?redirect=/shipping')
        }
        setValue('fullName', shippingAddress.fullName)
        setValue('address', shippingAddress.address)
        setValue('city', shippingAddress.city)
        setValue('country', shippingAddress.country)
        setValue('postalCode', shippingAddress.postalCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const classes = useStyles();

    const submitHandler = async (data: ShippingAdressType) => {
        dispatch!({ type: 'SAVE_SHIPPING_ADDRESS', payload: data });
        Cookies.set("shippingAddress", JSON.stringify(data));
        router.push('/payment')
    }

    return (
        <Layout title='Shipping Address'>
            <CheckoutWizard activeStep={1} />
            <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
                <Typography component="h1" variant='h1'>Shipping Address</Typography>
                <List>
                    <ListItem>
                        <Controller
                            name="fullName"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: true,
                                minLength: 2
                            }}
                            render={({ field }) => (
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    id="fullName"
                                    label="Full Name"
                                    inputProps={{ type: "fullName" }}
                                    error={Boolean(errors.fullName)}
                                    helperText={errors.fullName ?
                                        errors.fullName.type === 'minLength' ?
                                            'Full Name length is more than 1' :
                                            'Full Name is required' :
                                        ''}
                                    {...field}
                                />
                            )} />
                    </ListItem>
                    <ListItem>
                        <Controller
                            name="address"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: true,
                                minLength: 2
                            }}
                            render={({ field }) => (
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    id="address"
                                    label="Address"
                                    inputProps={{ type: "address" }}
                                    error={Boolean(errors.address)}
                                    helperText={errors.address ?
                                        errors.address.type === 'minLength' ?
                                            'Address length is more than 1' :
                                            'Address is required' :
                                        ''}
                                    {...field}
                                />
                            )} />
                    </ListItem>
                    <ListItem>
                        <Controller
                            name="city"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: true,
                                minLength: 2
                            }}
                            render={({ field }) => (
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    id="city"
                                    label="City"
                                    inputProps={{ type: "city" }}
                                    error={Boolean(errors.city)}
                                    helperText={errors.city ?
                                        errors.city.type === 'minLength' ?
                                            'City length is more than 1' :
                                            'City is required' :
                                        ''}
                                    {...field}
                                />
                            )} />
                    </ListItem>
                    <ListItem>
                        <Controller
                            name="postalCode"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: true,
                                minLength: 2
                            }}
                            render={({ field }) => (
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    id="postalCode"
                                    label="Postal Code"
                                    inputProps={{ type: "postalCode" }}
                                    error={Boolean(errors.postalCode)}
                                    helperText={errors.postalCode ?
                                        errors.postalCode.type === 'minLength' ?
                                            'Postal Code length is more than 1' :
                                            'Postal Code is required' :
                                        ''}
                                    {...field}
                                />
                            )} />
                    </ListItem>
                    <ListItem>
                        <Controller
                            name="country"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: true,
                                minLength: 2
                            }}
                            render={({ field }) => (
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    id="country"
                                    label="Country"
                                    inputProps={{ type: "country" }}
                                    error={Boolean(errors.country)}
                                    helperText={errors.country ?
                                        errors.country.type === 'minLength' ?
                                            'Country length is more than 1' :
                                            'Country is required' :
                                        ''}
                                    {...field}
                                />
                            )} />
                    </ListItem>
                    <ListItem>
                        <Button variant='contained' type='submit' fullWidth color='primary'>
                            Continue
                        </Button>
                    </ListItem>

                </List>
            </form>
        </Layout>
    )
}

export default Shippping