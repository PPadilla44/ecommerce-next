import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css'
import { StoreProvider } from '../utils/Store';

export default function MyApp({ Component, pageProps }: AppProps) {

    useEffect(() => {
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement?.removeChild(jssStyles);
        }
    }, []);

    return (
        <StoreProvider>
            <Component {...pageProps} />
        </StoreProvider>
    )
}