import { useState } from "react";
import styles from "./Login.module.css"
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function Login({ payload }) {
    console.log("payload", payload)
    const router = useRouter();
    const [loginError, setLoginError] = useState("");
    const [loginSuccess, setLoginSuccess] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
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
                router.push('/dashboard')
            } else {
                setLoginError("Invalid Credentials..!");
            }
        } catch (error) {
            setLoginError("Something wrong. Please try later");
            console.log(error);
        }
    }

    return (
        <Layout payload={payload}>
            <div className={styles.formSection}>
                <div></div>
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