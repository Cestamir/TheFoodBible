import jwt from "jsonwebtoken"

// roles + token validation

export const authenticate = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(400).json({message: 'No token provided for authorization.'});

    const token = authHeader.split(" ")[1];

    jwt.verify(token,process.env.JWT_SECRET,(err,decoded) => {
        if (err) return res.status(403).json({message: "Invalid token provided for verification."});
        req.user = decoded;
        next();
    })

}

export const authorizeRoles = (...roles) => {
    return (req,res,next) => {
        const user = req.user;
        if(!user || !roles.includes(user.role)){
            return res.status(403).json({message: "Access denied."})
        }
        next();
    }
}