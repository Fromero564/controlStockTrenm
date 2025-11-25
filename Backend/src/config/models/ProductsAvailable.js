module.exports = (sequelize, dataTypes) => {
    let alias = "ProductsAvailable";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        product_name: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        category_id: {
            type: dataTypes.INTEGER,
            allowNull: true
        },
        product_general_category: {
            type: dataTypes.STRING(255),
            allowNull: true,
        },
        min_stock: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        max_stock: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        alicuota: {
            type: dataTypes.FLOAT,
            allowNull: false,
        },
        unit_measure: {
            type: dataTypes.STRING, 
            allowNull: false,
            defaultValue: 'UN',
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
            as: "category",
        });

        ProductsAvailable.hasMany(models.ProductStock, {
            foreignKey: "product_cod",
            as: "stocks",
            onUpdate: "CASCADE",
        });
        ProductsAvailable.hasMany(models.ProductSubproduct, {
            foreignKey: "parent_product_id",
            as: "subproducts",
            onUpdate: "CASCADE",
        });
        ProductsAvailable.hasMany(models.ProductSubproduct, {
            foreignKey: "subproduct_id",
            as: "usedInProducts",
            onUpdate: "CASCADE",
        });

    };

    return ProductsAvailable;
};
