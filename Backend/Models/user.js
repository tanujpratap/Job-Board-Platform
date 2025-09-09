const{DataTypes}=require("sequelize")
const sequelize=require('../Models/index')// import your sequelize instance

const bcrypt=require('bcrypt')
const User=sequelize.define(
    "User",
    {
        id:{
            type:DataTypes.UUID,// Universally Unique Identifier
            defaultValue:DataTypes.UUIDV4,//auto-generated UUID
            primaryKey:true,
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false,
        }
        ,
        email:{
            type:DataTypes.STRING,
            allowNull:false,
            unique:true,//no duplicate email allowed
            validate:{
                isEmail:true,//validate email format

            },
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        role:{
            type:DataTypes.ENUM("admin","user","recruiter"),
            defaultValue:"user",

        },
        status:{
            type:DataTypes.BOOLEAN,
            defaultValue:true//active bydefault

        },

    },
    {
        tableName:"users",//Table name in db
        timestamps:true,//adds createdAt and updatedAt
    }
)

//hash password before saving
User.beforeCreate(async(user)=>{
    const salt=await bcrypt.genSalt(10)
    user.password=await bcrypt.hash(user.password,salt)

})
//compare password
User.prototype.isValidPassword=async function(password){
    return await bcrypt.compare(password,this.password)
}
module.exports=User;