import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
    try {
        const authHeader = req.rawHeaders[5];
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET)

        if (!decoded) {
            return res.status(400).json({ message: 'Invalid token' })
        }
        else if (decoded.exp < Math.floor(Date.now() / 1000)) {
            return res.status(400).json({ message: 'Expired' })
        }
        else {
            return res.status(200).json({ message: 'Success' })
        }
    }
    catch (error) {
        console.error('Token verification failed', error)
        return res.status(400).json({ message: 'Unauthorized' })
    }
}