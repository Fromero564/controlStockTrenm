module.exports = (sequelize, dataTypes) => {
    let alias = "ProductsAvailable";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_name: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        product_category: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        product_general_category: {
            type: dataTypes.STRING(255),
            allowNull: false,
        }



    };

    let config = {
        tableName: "products_available",
        timestamps: false,
    };

    const ProductsAvailable = sequelize.define(alias, cols, config);



    return ProductsAvailable;
};
