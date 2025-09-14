module.exports = (sequelize, dataTypes) => {
    let alias = 'ProductStock';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        product_name: {
            type: dataTypes.STRING(255),
            allowNull: false,

        },

        product_quantity: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
        product_total_weight: {
            type: dataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0
        },
        product_cod: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
        product_category: {
            type: dataTypes.STRING(255),
            allowNull: true,

        },
    };

    let config = {
        tableName: 'product_stock',
        timestamps: false,
    };

    const ProductStock = sequelize.define(alias, cols, config);

    ProductStock.associate = (models) => {
        ProductStock.belongsTo(models.ProductsAvailable, {
            foreignKey: "product_cod",
            targetKey: "id",
            as: "productAvailable",
        });
    };



    return ProductStock;
};
