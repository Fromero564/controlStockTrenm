module.exports = (sequelize, DataTypes) => {
  const alias = "ProductsSellOrder";

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sell_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    product_price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    product_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  };

  const config = {
    tableName: "products_sell_order",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  };

  const ProductsSellOrder = sequelize.define(alias, cols, config);

  ProductsSellOrder.associate = (models) => {
    ProductsSellOrder.belongsTo(models.NewOrder, {
      foreignKey: "sell_order_id",
      as: "order"
    });
    ProductsSellOrder.belongsTo(models.ProductsAvailable, {
      foreignKey: "product_id",
      as: "product"
    });
  };

  return ProductsSellOrder;
};