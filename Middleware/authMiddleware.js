const jwt = require('jsonwebtoken');

const authenticateToken = (req,res,next)=>{
    const token = req.cookie.token;
    if(!token)return res.status(401).send('Access Denied');

    try{
        const verfied = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verfied; 
        next()
    }catch(error){
        res.status(400).send('Invalid Token');
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).send('You do not have permission to perform this action');
      }
      next();
    }
};

module.exports = {authenticateToken, authorizeRoles}