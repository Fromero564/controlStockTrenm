module.exports = (sequelize, dataTypes) => {
  const alias = 'CutsDetail';

  const cols = {
    id: { type: dataTypes.BIGINT(10).UNSIGNED, primaryKey: true, autoIncrement: true },
    receipt_number: { type: dataTypes.BIGINT(10), allowNull: false },
    header_id: { type: dataTypes.BIGINT(10).UNSIGNED, allowNull: false },
    sub_item: { type: dataTypes.INTEGER, allowNull: false },
    lot_number: { type: dataTypes.STRING(50), allowNull: true },
    tare_weight: { type: dataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    gross_weight: { type: dataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    net_weight: { type: dataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  };

  const config = {
    tableName: 'cuts_detail',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };

  const CutsDetail = sequelize.define(alias, cols, config);

  CutsDetail.associate = (models) => {
    CutsDetail.belongsTo(models.CutsHeader, {
      as: 'header',
      foreignKey: 'header_id',
    });
  };

  return CutsDetail;
};
