import { Button, Link, List, ListItem, TextField, Typography } from '@material-ui/core'
import React from 'react'
import Layout from '../components/Layout'
import useStyles from '../utils/styles'
import NextLink from "next/link"

const Login = () => {

    const classes = useStyles();

    return (
        <Layout title='Login'>
            <form className={classes.form}>
                <Typography component="h1" variant='h1'>Login</Typography>
                <List>
                    <ListItem>
                        <TextField
                            variant='outlined'
                            fullWidth
                            id="email"
                            label="Email"
                            inputProps={{ type: "email" }}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            variant='outlined'
                            fullWidth
                            id="password"
                            label="Password"
                            inputProps={{ type: "password" }}
                        />
                    </ListItem>
                    <ListItem>
                        <Button variant='contained' type='submit' fullWidth color='primary'>
                            Login
                        </Button>
                    </ListItem>
                    <ListItem>
                        {`Dont't have an account?`} &nbsp; 
                        <NextLink href={"/register"} passHref>
                            <Link>Register</Link>
                        </NextLink>
                    </ListItem>
                </List>
            </form>
        </Layout>
    )
}

export default Login