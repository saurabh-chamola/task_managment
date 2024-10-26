export const checkRole = (...validRoles) => {
    return (req, res, next) => {
        if (!req?.role || !validRoles.includes(req.role?.toString())) {
            return res.status(403).json({
                status: false,
                message: `Access denied! Role: ${req?.role} does not have access to this route-Please logged in with diffrent role`
            });
        }
        next();
    };
};
