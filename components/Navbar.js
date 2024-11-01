import styles from "./Navbar.module.css"
import { IoHome } from "react-icons/io5";
import { FaRegUser, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const handleWorklistClick = () => {
        router.replace({
            pathname: "/worklist"
        })
    }

    return (
        <div className={styles.navbarSection}>
            <div className={styles.home} onClick={() => window.location.href = "/"}>
                <IoHome />
            </div>
            <div className={styles.profile}>
                <div onClick={() => handleWorklistClick()} className={styles.worklist}>worklist</div>
                <div className={styles.logo}>
                    <FaRegUser style={isOpen ? { color: '#FFF' } : {}} onClick={() => setIsOpen(!isOpen)} />
                    {
                        isOpen && (
                            <div className={styles.profileSection}>
                                <div className={styles.cancelProfile} onClick={() => setIsOpen(!isOpen)}><FaTimes /></div>
                                <div className={styles.profileItem}>Profile</div>
                                <div className={styles.profileItem}
                                    onClick={
                                        () => {
                                            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                            document.location.href = "/login";
                                        }
                                    }
                                >Logout</div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div >
    );
}