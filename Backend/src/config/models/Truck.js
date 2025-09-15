module.exports = (sequelize, DataTypes) => {
  const Truck = sequelize.define(
    "Truck",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      brand: { type: DataTypes.STRING(80), allowNull: false },
      model: { type: DataTypes.STRING(120), allowNull: false },
      plate: { type: DataTypes.STRING(15), allowNull: false, unique: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: "trucks",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Truck;
};
