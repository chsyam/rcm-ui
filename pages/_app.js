import Layout from "@/components/Layout";

function MyApp({ Component, pageProps }) {
    return (
        <Layout suppressHydrationWarning >
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;