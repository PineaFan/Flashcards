import { AppProps } from 'next/app'
import '../styles/globals.css';
import { Helmet } from 'react-helmet';
import { SessionProvider } from 'next-auth/react';


export default function App({
    Component,
    pageProps: { session, ...pageProps }
}: AppProps) {
    return <SessionProvider session={session}>
        <div className='main'>
            <Helmet htmlAttributes={{ lang: "en" }} />
            <Component {...pageProps} />
        </div>
    </SessionProvider>
}
