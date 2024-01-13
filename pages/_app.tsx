import { AppProps } from 'next/app'
import '../styles/globals.css';
import { Helmet } from 'react-helmet';


export default function App({ Component, pageProps }: AppProps) {
    return <div className='main'>
        <Helmet htmlAttributes={{ lang: "en" }} />
        <Component {...pageProps} />
    </div>
}
