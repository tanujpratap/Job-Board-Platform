const {DataTypes}=require("sequelize");
const sequelize=require('../Models/index')
const User=require('./user')
const Job=require('./job')
const Application=sequelize.define("Application",{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    job_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:Job,
            key:"id"
        },
        onDelete:"CASCADE"
    },
    applicant_id:{
        type:DataTypes.UUID,
        allowNull:false,
        references:{
            model:User,
            key:"id"
        },
        onDelete:"CASCADE"
    },
    resume_url:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            isURL:{
                msg:"Resume must be a valid URL"
            }
        }
    },
    status:{
        type:DataTypes.ENUM("pending","reviewed","shortlisted","rejected","applied"),
        defaultValue:"pending"
    }
})

//associations
User.hasMany(Application,{foreignKey:"applicant_id",as:"applications"})
Application.belongsTo(User,{foreignKey:"applicant_id",as:"applicant"})
Job.hasMany(Application,{foreignKey:"job_id",as:"applications"})
Application.belongsTo(Job,{foreignKey:"job_id",as:"job"})
module.exports=Application;