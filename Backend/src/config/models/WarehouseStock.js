module.exports = (sequelize, DataTypes) => {
  const alias = 'WarehouseStock';

  const cols = {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    id_warehouse: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  };

  const config = {
    tableName: 'warehouse_stock',
    timestamps: false
  };

  const WarehouseStock = sequelize.define(alias, cols, config);

  // Relaciones
  WarehouseStock.associate = (models) => {
    WarehouseStock.belongsTo(models.Warehouses, {
      foreignKey: 'id_warehouse',
      as: 'warehouse',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return WarehouseStock;
};
