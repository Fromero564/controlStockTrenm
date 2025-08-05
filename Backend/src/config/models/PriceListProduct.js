module.exports = (sequelize, DataTypes) => {
  const PriceListProduct = sequelize.define('PriceListProduct', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    price_list_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    unidad_venta: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    costo: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    precio_sin_iva: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    precio_con_iva: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    }
  }, {
    tableName: 'price_list_products',
    timestamps: false
  });

  return PriceListProduct;
};
