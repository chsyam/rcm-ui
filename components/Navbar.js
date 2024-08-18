import styles from "./Navbar.module.css"
import { IoHome } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
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
                <div className={styles.logo}
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => {
                        setTimeout(() => {
                            setIsOpen(false)
                        }, 1000);
                    }}>
                    <FaRegUser style={isOpen ? { color: '#FFF' } : {}} onClick={() => setIsOpen(true)} />
                    {
                        isOpen && (
                            <div className={styles.profileSection}>
                                <div className={styles.profileItem}>Profile</div>
                                <div className={styles.profileItem}>Logout</div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div >
    );
}