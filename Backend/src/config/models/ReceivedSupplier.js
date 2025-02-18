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
        actual_date: {
            type: dataTypes.DATE(255),
            allowNull: false
        },
        time_hours: {
            type: dataTypes.STRING(11),
            allowNull: false
        },
       
        remit_number:{
            type: dataTypes.BIGINT(10),
            allowNull: false
        }
    };
    let config = {
        tableName:"received_suppliers",
        timestamps: true, 
    };
    const ReceivedSupplier = sequelize.define(alias, cols, config);


    return ReceivedSupplier

};
