import axios from "axios";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'

export default async function loginHandler(req, res) {
    const { email, password } = { email: req.body['email'], password: req.body['password'] };
    try {
        const response = await axios.post(`http://localhost:75/login`, {
            params: {
                email: email,
                password: password
            }
        });
        console.log(response);
        const user = response.data.user;
        if (response.status === 200 && user) {
            console.log("user =>", user);
            const token = jwt.sign({
                userId: user?.userId,
                email: user[0],
                username: user[1],
                admin_user: user[3],
                app_cntrl_owner: user[4],
                dashboard_user: user[5]
            }, process.env.JWT_SECRET, {
                expiresIn: '1440m',
            })
            console.log(token)
            return res.status(200).json({ token: token, message: 'Login successful' });
        } else {
            console.log("user not found", "Invalid Credentials...!");
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.log("error fetching api details", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}