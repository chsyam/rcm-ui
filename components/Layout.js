import Navbar from "./Navbar";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
    const router = useRouter();

    return (
        <>
            {router.pathname !== "/login" &&
                <Navbar />
            }
            <div style={{ paddingTop: router.pathname !== "/login" ? '150px' : '40px' }}>
                <main>{children}</main>
            </div>
        </>
    );
};

export default Layout;