module.exports = (sequelize, dataTypes) => {
  let alias = "CamaraManualCut";

  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    bill_supplier_id: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },

    product_name: {
      type: dataTypes.STRING(120),
      allowNull: false,
    },

    garron: {
      type: dataTypes.STRING(50),
      allowNull: true,
    },

    head: {
      type: dataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    quantity: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    provider_weight: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    gross_weight: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    tare_weight: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    tara_id: {
      type: dataTypes.INTEGER,
      allowNull: true,
    },

    net_weight: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    unique_code: {
      type: dataTypes.STRING(80),
      allowNull: true,
    },

    a_camara: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  };

  let config = {
    tableName: "camara_manual_cuts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  };

  const CamaraManualCut = sequelize.define(alias, cols, config);

  CamaraManualCut.associate = (models) => {
    CamaraManualCut.belongsTo(models.BillSupplier, {
      as: "billSupplier",
      foreignKey: "bill_supplier_id",
    });
  };

  return CamaraManualCut;
};
