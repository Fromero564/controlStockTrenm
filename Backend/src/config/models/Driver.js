
module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    "Driver",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      driver_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      driver_surname: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      driver_state: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: "drivers",
      timestamps: false,
      underscored: true,
    }
  );

  return Driver;
};
