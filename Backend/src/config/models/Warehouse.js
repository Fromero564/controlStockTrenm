module.exports = (sequelize, dataTypes) => {
    let alias = 'Warehouses';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        Warehouse_name:{
            type: dataTypes.STRING(100),
            allowNull: false
        },
        };
    let config = {
        tableName: 'warehouses',
        timestamps: false,     
    }
    const Warehouses = sequelize.define(alias, cols, config); 
    
    
    return Warehouses
  
    };
