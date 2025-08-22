module.exports = (sequelize, DataTypes) => {
    const PaymentCondition = sequelize.define("PaymentCondition", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        payment_condition: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
    },
        {
            tableName: "payment_conditions",
            timestamps: false,
        });



    return PaymentCondition;
};
