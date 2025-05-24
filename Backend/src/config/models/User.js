module.exports = (sequelize, dataTypes) => {
    let alias = 'User';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        user:{
            type: dataTypes.STRING(255),
            allowNull: false
        },
        rol:{
            type: dataTypes.STRING(255),
            allowNull: false
        },
        password: {type: dataTypes.STRING(255),
        allowNull: false
        }
        };
    let config = {
        tableName: 'users',
        createdAt: 'create_date',  
        updatedAt: 'updated_at'    
    }
    const User = sequelize.define(alias, cols, config); 
    
    
    return User
  
    };
