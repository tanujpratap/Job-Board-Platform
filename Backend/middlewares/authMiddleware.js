const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../Models/user");
const env=require('dotenv').config()
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 🔹 Check if token is blacklisted in Redis
    // const isBlacklisted = await redisClient.get(`bl_${token}`);
    // if (isBlacklisted) {
    //   return res.status(401).json({ message: "Token is blacklisted" });
    // }

    // 🔹 Verify JWT
    let decoded;
    try{
decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
     
    catch(err){
      return res.status(401).json({message:'Invalid or expired token'})
    }
    //check redis for active session
    const storedToken=await redisClient.get(`token:${decoded.id}`)
    if(!storedToken||storedToken!==token){
      return res.status(401).json({message:"Session expired please login again"})

    }

    
    // Attach user + role
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,// still attaching in case you need it later
    };

    next();
  } catch (err) {
    console.error("Auth middleware error",err)
    return res.status(401).json({ message: "Internal server error" });
  }
};

module.exports = authMiddleware;

