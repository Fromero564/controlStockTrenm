module.exports = (sequelize, dataTypes) => {
    let alias = "ProductCategories";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        category_name: {
            type: dataTypes.STRING(100),
            allowNull: false
        },



    };

    let config = {
        tableName: "product_categories",
        timestamps: false,
    };

    const ProductCategories = sequelize.define(alias, cols, config);
    ProductCategories.associate = (models) => {
        ProductCategories.hasMany(models.ProductsAvailable, {
            foreignKey: 'category_id',
            as: 'products'
        });
    };


    return ProductCategories;
};
