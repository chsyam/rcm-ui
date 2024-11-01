import { useState } from "react";
import styles from "./Login.module.css"
import Link from "next/link";
import { useRouter } from "next/router";
import { decrypt } from "../api/auth/lib";
import Layout from "@/components/Layout";

export default function Login({ payload }) {
    console.log("payload", payload)
    const router = useRouter();
    const [loginError, setLoginError] = useState("");
    const [loginSuccess, setLoginSuccess] = useState("");
    const [formData, setFormData] = useState({
        email: "user1@tcs.com",
        password: "user1@123"
    })
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            console.log(response);
            if (response === null) {
                setLoginSuccess("");
                setLoginError("Invalid Credentials..!");
            }
            else if (response.status === 200) {
                setLoginError("");
                setLoginSuccess("Login successfull");
                const { token } = await response.json()
                document.cookie = `token=${token}; path=/`
                setTimeout(() => {
                    router.push('/dashboard')
                }, 100);
            } else {
                setLoginError("Something went wrong while login. Please try again later");
            }
        } catch (error) {
            setLoginError("Something went wrong while login. Please try again later");
            console.log(error);
        }
    }

    return (
        <Layout payload={payload}> 
            <div className={styles.formSection}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.heading}>
                        <div className={styles.title}>Login to your account</div>
                        <div className={styles.sectionInfo}>Enter your information to get started</div>
                    </div>
                    <div className={styles.fieldError}>
                        {loginError && loginError}
                    </div>
                    <div className={styles.fieldSuccess}>
                        {loginSuccess && loginSuccess}
                    </div>
                    <div className={styles.formElement}>
                        <label htmlFor="email">Email</label><br />
                        <input
                            value={formData.email}
                            onChange={handleChange} name="email" id="email" placeholder="john@example.com" />
                    </div>
                    <div className={styles.formElement}>
                        <label htmlFor="password">Password</label><br />
                        <input
                            value={formData.password}
                            onChange={handleChange} type="password" name="password" id="password" placeholder="Enter password" />
                    </div>
                    <div className={styles.submitButton}>
                        <button type="submit">Login</button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}