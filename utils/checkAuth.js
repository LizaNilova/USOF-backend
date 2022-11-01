import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const checkAuth = async (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decode.id);
            
            if (!user) {
                return res.json({ success: false, message: 'unauthorized access!' });
            }
            req.userId = decode.id
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.json({ success: false, message: 'unauthorized access!' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.json({
                    success: false,
                    message: 'sesson expired try sign in!',
                });
            }

            res.json({ success: false, message: 'Internal server error!' });
        }
    } else {
        res.json({ success: false, message: 'unauthorized access!' });
    }
}