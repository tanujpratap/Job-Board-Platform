module.exports=function roleMiddleware(allowedRoles=[]){
    return (req,res,next)=>{
        try{
            const user=req.user;//come from authMiddleware
            if(!user){
                return res.status(401).json({mesage:"Unauthorized:No user Found"})
            }
            if(!allowedRoles.includes(user.role)){
                return res.status(403).json({message:"Forbidden: you dont have access"})

            }
            next()

        }
        catch(error){
            console.error("Role Middleware Error:",error.message);
            return res.status(500).json({message:"Internal Server Error"})
            
        }
    }
}