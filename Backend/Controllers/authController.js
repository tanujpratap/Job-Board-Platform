const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User= require("../Models/user");
const env=require('dotenv').config()
// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
const register=async(req,res)=>{
    try{
        const{name,email,password,role}=req.body;
        const existingUser=await User.findOne({where:{email}})
        if(existingUser){
            return res.status(400).json({message:'email already in use'})

        }
        const user=await User.create({name,email,password,role})
        res.status(201).json({
            message:"user registered successfully",
              user:{
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role

        }
        })
      
    }
    catch(err){
        res.status(500).json({message:"registration failed",error:err.message})
    }
}
const login=async(req,res)=>{
  try{
const{email,password}=req.body;
const user=await User.findOne({where:{email}})
if(!user||!(await user.isValidPassword(password))){
  return res.status(401).json({message:"Invalid credentials"})

}
const{accessToken,refreshToken}=generateTokens(user)
//save refresh token in Redis
await redisClient.set(`refresh_${user.id}`,refreshToken,{EX:7*24*60*60})
// Save access token in Redis for session validation
await redisClient.set(`token:${user.id}`, accessToken, {EX: 15*60}); // 15 minutes expiry

res.json({
  message:"Login successful",
  accessToken,
  refreshToken,
  user:{
    id:user.id,
    name:user.name,
    email:user.email,
    role:user.role
  }
})
  }
  catch(err){
res.status(500).json({message:"login failed",error:err.message})
  }
}

module.exports = { register ,login};