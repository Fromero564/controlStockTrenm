module.exports = (sequelize, dataTypes) => {
  let alias = "CamaraRomaneoCut";

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

    quantity: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    heads: {
      type: dataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    romaneo_weight: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    garron_number: {
      type: dataTypes.STRING(50),
      allowNull: true,
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
    tableName: "camara_romaneo_cuts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  };

  const CamaraRomaneoCut = sequelize.define(alias, cols, config);

  CamaraRomaneoCut.associate = (models) => {
    CamaraRomaneoCut.belongsTo(models.BillSupplier, {
      as: "billSupplier",
      foreignKey: "bill_supplier_id",
    });
  };

  return CamaraRomaneoCut;
};