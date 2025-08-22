

module.exports = (sequelize, DataTypes) => {
    const OrderProductClient = sequelize.define("OrderProductClient", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_cod: {
            type: DataTypes.STRING,
            allowNull: false
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        precio: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        cantidad: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        tipo_medida: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: "order_products_client",
        timestamps: false
    });

   
    OrderProductClient.associate = function(models) {
        OrderProductClient.belongsTo(models.NewOrder, { foreignKey: "order_id", as: "order" });
    };

    return OrderProductClient;
};
