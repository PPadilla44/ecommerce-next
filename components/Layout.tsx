import Head from 'next/head'
import React, { PropsWithChildren } from 'react'
import NextLink from "next/link"
import { AppBar, Toolbar, Typography, Container, Link } from "@material-ui/core"
import useStyles from "../utils/styles"


interface LayoutProps {
    title?: string;
    description?: string;
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children, title, description }) => {

    const classes = useStyles();

    return (
        <div>
            <Head>
                <title>{ title ? `${title} - Next Amazona` : 'Next Amazona' }</title>
                { description && <meta name="description" content={description}/> }
            </Head>
            <AppBar position='static' className={classes.navbar}>
                <Toolbar>
                    <NextLink href={"/"} passHref>
                        <Link>
                            <Typography className={classes.brand}>amazona</Typography>
                        </Link>
                    </NextLink>
                    <div className={classes.grow}></div>
                    <div>
                        <NextLink href={"/cart"} passHref>
                            <Link>Cart</Link>
                        </NextLink>
                        <NextLink href={"/login"} passHref>
                            <Link>Login</Link>
                        </NextLink>
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
        </div>
    )
}

export default Layout;
