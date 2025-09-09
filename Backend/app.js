const express=require('express')
const app=express()
const dotenv=require('dotenv').config({ debug: false })
const cors=require('cors')
const authRoutes = require("./Routes/authRoutes.js");
const jobRoutes=require("./Routes/jobRoutes.js")
const applicationRoutes=require('./Routes/applicationRoutes.js')
app.use(express.json())
app.use(cors())
const sequelize = require('./Models/index.js')
const port=process.env.PORT
app.use("/api/auth", authRoutes);
app.use("/api/jobs",jobRoutes);
app.use("/api/application",applicationRoutes);





sequelize.authenticate()
.then(()=>{console.log("connected to postgressql")
return sequelize.sync()})
.then(() => {
    app.listen(port, () =>
        console.log(`app listening on port ${port}`)
    );
})
.catch(err=>console.error("unable to connect:",err))
// app.listen(port,() =>
//    console.log( `app listening on port ${port}`)
//    )