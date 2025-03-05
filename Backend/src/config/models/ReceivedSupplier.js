module.exports = (sequelize, dataTypes) => {
    let alias = 'ReceivedSupplier';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        supplier: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        total_weight: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        head_quantity: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        unit_weight: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        internal_number:{
            type: dataTypes.BIGINT(10),
            allowNull: false
        },
       
        romaneo_number:{
            type: dataTypes.BIGINT(10),
            allowNull: false
        },
         income_state: {
            type: dataTypes.STRING(255),
            allowNull: false
        },  
        check_state: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
        }
    };
    let config = {
        tableName:"received_suppliers",
        timestamps: true, 
    };
    const ReceivedSupplier = sequelize.define(alias, cols, config);


    return ReceivedSupplier

};
