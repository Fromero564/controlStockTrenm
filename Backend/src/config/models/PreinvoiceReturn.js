module.exports = (sequelize, DataTypes) => {
  const PreinvoiceReturn = sequelize.define('PreinvoiceReturn', {
    preinvoice_id: DataTypes.INTEGER,
    client_id: DataTypes.INTEGER,
    client_name: DataTypes.STRING,
    units_redirected: { type: DataTypes.DECIMAL(12,3), defaultValue: 0 },
    kg_redirected:    { type: DataTypes.DECIMAL(12,3), defaultValue: 0 },
    reason: { type: DataTypes.ENUM('REDIRECT', 'STOCK'), defaultValue: 'REDIRECT' }
  }, {
    tableName: 'preinvoice_returns',
    underscored: true
  });

  PreinvoiceReturn.associate = (models) => {
    PreinvoiceReturn.belongsTo(models.Preinvoice, {
      as: 'preinvoice',
      foreignKey: 'preinvoice_id'
    });
  };

  return PreinvoiceReturn;
};
