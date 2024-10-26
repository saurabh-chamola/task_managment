import jsonwebtoken from "jsonwebtoken";
const jwt = jsonwebtoken;

export const verifyTokenMiddleware = (req, res, next) => {

    const token = req?.cookies?.ACCESS_TOKEN;

    if (!token) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized!!! -- Please check your login credentials.",
        });
    }

    jwt.verify(token, process.env.ACCESS_SECRET_KEY, (error, user) => {
        if (error) {
            return res.status(403).json({
                success: false,
                message: `Unauthorized!!! -- Invalid token. ${error.message}`,
            });
        }

        req.userId = user?.id;
        req.role = user?.role;

        return next();
    });
};
