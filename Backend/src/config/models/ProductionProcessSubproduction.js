// src/config/models/ProductionProcessSubproduction.js
module.exports = (sequelize, DataTypes) => {
  const ProductionProcessSubproduction = sequelize.define(
    "ProductionProcessSubproduction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      process_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cut_name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "productionprocess_subproduction",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );



  return ProductionProcessSubproduction;
};
