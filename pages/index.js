import Layout from "@/components/Layout";

export default function HomePage() {
    return (
        <Layout></Layout>
    );
}

export async function getServerSideProps() {
    return {
        redirect: {
            destination: '/dashboard',
            permanent: false,
        },
    };
}