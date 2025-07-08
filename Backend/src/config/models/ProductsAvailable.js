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
        category_id: {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        product_general_category: {
            type: dataTypes.STRING(255),
            allowNull: false,
        },
        min_stock: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
        max_stock: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
    };

    let config = {
        tableName: "products_available",
        timestamps: false,
    };

    const ProductsAvailable = sequelize.define(alias, cols, config);


    ProductsAvailable.associate = (models) => {
        ProductsAvailable.belongsTo(models.ProductCategories, {
            foreignKey: "category_id",
            as: "category"
        });

        ProductsAvailable.hasMany(models.ProductStock, {  
            foreignKey: "product_cod",
            as: "stocks",
        });
    };

    return ProductsAvailable;
};
