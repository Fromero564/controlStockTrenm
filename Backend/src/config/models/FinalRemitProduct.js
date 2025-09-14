module.exports = (sequelize, DataTypes) => {
  const FinalRemitProduct = sequelize.define('FinalRemitProduct', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    final_remit_id: DataTypes.INTEGER,
    product_id: DataTypes.STRING(50),
    product_name: DataTypes.STRING(200),
    unit_price: DataTypes.DECIMAL(10,2),
    qty: DataTypes.DECIMAL(10,2),
    unit_measure: DataTypes.STRING(10),
    gross_weight: DataTypes.DECIMAL(10,2),
    net_weight: DataTypes.DECIMAL(10,2),
    avg_weight: DataTypes.DECIMAL(10,2),
  }, {
    tableName: 'final_remit_products',
    underscored: true
  });

  FinalRemitProduct.associate = (models) => {
    FinalRemitProduct.belongsTo(models.FinalRemit, {
      as: 'remit',
      foreignKey: 'final_remit_id'
    });
  };

  return FinalRemitProduct;
};
