import Navbar from "./Navbar";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
    const router = useRouter();

    return (
        <>
            {router.pathname !== "/login" &&
                <Navbar />
            }
            <div style={{ paddingTop: router.pathname !== "/login" ? router.pathname === '/dashboard' ? '150px' : '100px' : '40px' }}>
                <main>{children}</main>
            </div>
        </>
    );
};

export default Layout;