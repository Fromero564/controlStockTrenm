module.exports = (sequelize, DataTypes) => {
    const SaleCondition = sequelize.define(
        "SaleCondition",
        {
            id: {
                type: DataTypes.INTEGER, primaryKey: true,
                autoIncrement: true
            },

            condition_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
        },
        {
            tableName: "sale_conditions",
            timestamps: false
        }
    );
    return SaleCondition;
};