import Head from 'next/head'
import React, { useContext, useEffect, useState } from 'react'
import NextLink from "next/link"
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Link,
    createTheme,
    ThemeProvider,
    CssBaseline,
    Switch,
    Badge,
    Button,
    Menu,
    MenuItem,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    Divider,
    ListItemText,
} from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"
import CancelButton from "@material-ui/icons/Cancel"
import useStyles from "../utils/styles"
import { Store } from "../utils/Store"
import Cookies from "js-cookie"
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import { getError } from '../utils/error'
import { ProductType } from '../types'

interface LayoutProps {
    title?: string;
    description?: string;
    children: React.ReactChild
}

const Layout: React.FC<LayoutProps> = ({ children, title, description }) => {

    const router = useRouter();
    const { state, dispatch } = useContext(Store);
    const { darkMode, cart, userInfo } = state;

    const [sidebarVisibile, setSidebarVisibile] = useState(false);
    const [categories, setCategories] = useState<ProductType['category'][]>([]);
    const { enqueueSnackbar } = useSnackbar();

    const theme = createTheme({
        typography: {
            h1: {
                fontSize: "1.6rem",
                fontWeight: 400,
                margin: "1rem 0"
            },
            h2: {
                fontSize: "1.4rem",
                fontWeight: 400,
                margin: "1rem 10"
            },
        },
        palette: {
            type: darkMode ? 'dark' : 'light',
            primary: {
                main: "#f0c000"
            },
            secondary: {
                main: "#208080"
            }
        }
    })

    const classes = useStyles();


    const darkModeChangeHandler = () => {
        dispatch!({ type: darkMode ? 'DARK_MODE_OFF' : 'DARK_MODE_ON' });
        const newDarkMode = !darkMode;
        Cookies.set('darkMode', newDarkMode ? 'ON' : 'OFF');
    }

    const [anchorEl, setAnchorEl] = useState<any>(null)
    const loginClickHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setAnchorEl(e.currentTarget)
    }

    const loginMenuCloseHandler = (e: React.SyntheticEvent, redirect: string) => {
        setAnchorEl(null);
        if (redirect) {
            router.push(redirect)
        }
    }
    const logoutClickHandler = () => {
        setAnchorEl(null);
        dispatch!({ type: 'USER_LOGOUT' });
        Cookies.remove('userInfo');
        Cookies.remove('cartItems');
        router.push("/")
    }

    const sidebarOpenHandler = () => {
        setSidebarVisibile(true);
    }
    const sidebarCloseHandler = () => {
        setSidebarVisibile(false);
    }

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get<ProductType['category'][]>(`/api/products/categories`);
            setCategories(data);
        } catch (err) {
            enqueueSnackbar(getError(err), { variant: 'error' })
        }
    }

    useEffect(() => {
        fetchCategories();
    }, [])

    return (
        <div>

            <Head>
                <title>{title ? `${title} - Next Amazona` : 'Next Amazona'}</title>
                {description && <meta name="description" content={description} />}
            </Head>

            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AppBar position='static' className={classes.navbar}>
                    <Toolbar className={classes.toolbar}>
                        <Box display={"flex"} alignItems="center">
                            <IconButton
                                edge="start"
                                aria-label='open drawer'
                                onClick={sidebarOpenHandler}
                            >
                                <MenuIcon className={classes.navbarButon} />
                            </IconButton>
                            <NextLink href={"/"} passHref>
                                <Link>
                                    <Typography className={classes.brand}>amazona</Typography>
                                </Link>
                            </NextLink>
                        </Box>
                        <Drawer
                            anchor='left'
                            open={sidebarVisibile}
                            onClose={sidebarCloseHandler}
                        >
                            <List>
                                <ListItem>
                                    <Box
                                        display={"flex"}
                                        alignItems="center"
                                        justifyContent={'space-between'}>
                                        <Typography>Shopping by category</Typography>
                                        <IconButton
                                            aria-label='close'
                                            onClick={sidebarCloseHandler}>
                                            <CancelButton />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                                <Divider light />
                                {categories.map((category) => (
                                    <NextLink
                                        key={category}
                                        href={`/search?category=${category}`}
                                        passHref
                                    >
                                        <ListItem
                                            button
                                            component={"a"}
                                            onClick={sidebarCloseHandler}>
                                            <ListItemText primary={category} />
                                        </ListItem>
                                    </NextLink>
                                ))}
                            </List>
                        </Drawer>
                        <div className={classes.grow}></div>
                        <div>
                            <Switch checked={darkMode} onChange={darkModeChangeHandler} />
                            <NextLink href={"/cart"} passHref>
                                <Link>
                                    <Typography component={"span"}>

                                        {
                                            cart.cartItems.length > 0 ?
                                                <Badge overlap='rectangular' color='secondary' badgeContent={cart.cartItems.length}>
                                                    Cart
                                                </Badge>
                                                :
                                                'Cart'
                                        }
                                    </Typography>
                                </Link>
                            </NextLink>
                            {
                                userInfo ?
                                    <>
                                        <Button
                                            aria-controls='simple-menu'
                                            aria-haspopup='true'
                                            onClick={loginClickHandler}
                                            className={classes.navbarButon} >
                                            {userInfo.name}
                                        </Button>
                                        <Menu
                                            id="simple-menu"
                                            anchorEl={anchorEl}
                                            keepMounted
                                            open={Boolean(anchorEl)}
                                            onClose={loginMenuCloseHandler}
                                        >
                                            <MenuItem onClick={(e) => loginMenuCloseHandler(e, '/profile')}>Profile</MenuItem>
                                            <MenuItem onClick={(e) => loginMenuCloseHandler(e, '/order-history')}>Order History</MenuItem>
                                            {
                                                userInfo.isAdmin && <MenuItem onClick={(e) => loginMenuCloseHandler(e, '/admin/dashboard')}>Admin Dashboard</MenuItem>

                                            }
                                            <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                                        </Menu>
                                    </>
                                    :

                                    <NextLink href={"/login"} passHref>
                                        <Link>
                                            <Typography component={"span"}>
                                                Login
                                            </Typography>
                                        </Link>
                                    </NextLink>
                            }
                        </div>
                    </Toolbar>
                </AppBar>
                <Container className={classes.main}>
                    {children}
                </Container>
                <footer className={classes.footer}>
                    <Typography>
                        All right reserved. Next Amazona
                    </Typography>
                </footer>
            </ThemeProvider>

        </div>
    )
}

export default Layout;
