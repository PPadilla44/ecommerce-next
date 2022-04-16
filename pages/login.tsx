import { Button, Link, List, ListItem, TextField, Typography } from '@material-ui/core'
import React, { useState, useContext, useEffect } from 'react'
import Layout from '../components/Layout'
import useStyles from '../utils/styles'
import NextLink from "next/link"
import axios from 'axios'
import { Store } from '../utils/Store'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const Login = () => {
    const router = useRouter();
    const { redirect } = router.query;
    const { state, dispatch } = useContext(Store);
    const { userInfo } = state;

    useEffect(() => {
        if (userInfo) {
            router.push('/')
        }
    }, [])

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const classes = useStyles();

    const submitHandler = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            dispatch!({ type: 'USER_LOGIN', payload: data });
            Cookies.set("userInfo", data);
            console.log(Cookies.get('userInfo') as string);
            
            let test = JSON.parse(Cookies.get('userInfo') as string);
            console.log(test);
            
            router.push(redirect as string || "/")
        } catch (err: any) {
            alert(err?.response?.data ? err.response.data.message : err.message)
        }
    }

    return (
        <Layout title='Login'>
            <form onSubmit={submitHandler} className={classes.form}>
                <Typography component="h1" variant='h1'>Login</Typography>
                <List>
                    <ListItem>
                        <TextField
                            variant='outlined'
                            fullWidth
                            id="email"
                            label="Email"
                            inputProps={{ type: "email" }}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            variant='outlined'
                            fullWidth
                            id="password"
                            label="Password"
                            inputProps={{ type: "password" }}
                            onChange={e => setPassword(e.target.value)}
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