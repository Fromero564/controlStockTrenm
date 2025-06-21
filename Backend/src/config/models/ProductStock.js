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
        product_cod: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
            product_category: {
            type: dataTypes.STRING(255),
            allowNull: false,

        },
    };

    let config = {
        tableName: 'product_stock',
          timestamps: false,
    };

    const ProductStock = sequelize.define(alias, cols, config);


    return ProductStock;
};
