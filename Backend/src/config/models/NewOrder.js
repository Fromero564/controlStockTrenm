module.exports = (sequelize, DataTypes) => {
    let alias = "NewOrder";
    let cols = {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        date_order: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        client_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        salesman_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        price_list: {
            type: DataTypes.STRING(255),
            allowNull: true, 
            defaultValue: null
        },
        sell_condition: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        payment_condition: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        observation_order: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    };

    let config = {
        tableName: "new_orders",
        timestamps: false
    };

    const NewOrder = sequelize.define(alias, cols, config);

    return NewOrder;
};
