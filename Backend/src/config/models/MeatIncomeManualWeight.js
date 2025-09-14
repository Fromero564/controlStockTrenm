
module.exports = (sequelize, DataTypes) => {
  const MeatIncomeManualWeight = sequelize.define("MeatIncomeManualWeight", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bill_supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_weight: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
  }, {
    tableName: "meat_income_manual_weight",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

  MeatIncomeManualWeight.associate = (models) => {
    MeatIncomeManualWeight.belongsTo(models.BillSupplier, {
      foreignKey: "bill_supplier_id",
      as: "billSupplier",
    });
  };

  return MeatIncomeManualWeight;
};
