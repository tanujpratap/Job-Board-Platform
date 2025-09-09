const{Datatypes, DataTypes}=require('sequelize')
const sequelize=require('../Models/index')//your sequelize instancec
const User=require('./user')//recruiter id will refrence to user Model

const Job=sequelize.define("Job",{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,//auto generated UUID
        primaryKey:true,

    },
    title:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    skills:{
        type:DataTypes.ARRAY(DataTypes.STRING),//store multiple skills
        allowNull:false
    },
    location:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    salary_range:{
        type:DataTypes.STRING,//example: "6 LPA - 12 LPA"
        allowNull:true,
    },
    experience:{
        type:DataTypes.STRING,// example: "2-4 years"
        allowNull:true,
    },
    recruiter_id:{
        type:DataTypes.UUID,
        allowNull:false,
        refrences:{
            model:"Users",//table name(from User Model)
            key:"id",
        },
        onDelete:"CASCADE",//if recruiter is deleted, deleted their jobs

    },
    status:{
        type:DataTypes.ENUM("active","inactive"),
        defaultValue:"active"
    }

},
{
    tableName:"Jobs",
    timestamps:true,//createdAt & updatedAt
}
);
//Associations
Job.belongsTo(User,{
    foreignKey:"recruiter_id",as:"recruiter"
})
User.hasMany(Job,{foreignKey:"recruiter_id",as:"jobs"});
module.exports=Job


