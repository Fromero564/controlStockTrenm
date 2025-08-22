module.exports = (sequelize, DataTypes) => {
  const ProductSubproduct = sequelize.define("ProductSubproduct", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    parent_product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subproduct_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    // ⬇️ Nuevo campo unit sin restricción
    unit: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  }, {
    tableName: "product_subproducts",
    timestamps: false,
  });

  ProductSubproduct.associate = (models) => {
    ProductSubproduct.belongsTo(models.ProductsAvailable, {
      foreignKey: "parent_product_id",
      as: "parentProduct",
    });
    ProductSubproduct.belongsTo(models.ProductsAvailable, {
      foreignKey: "subproduct_id",
      as: "subProduct",
    });
  };

  return ProductSubproduct;
};
