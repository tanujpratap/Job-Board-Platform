const{Sequelize}=require('sequelize')

const db=require('../config/db').development
const sequelize=new Sequelize(
    db.database,
    db.username,
    db.password,
    {
        host:db.host,
        port:db.port,
        dialect:db.dialect,
        logging:false

    }
)

module.exports=sequelize;