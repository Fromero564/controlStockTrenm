module.exports = (sequelize, DataTypes) => {
  const PriceList = sequelize.define('PriceList', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    list_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'price_lists',
    timestamps: false
  });

  return PriceList;
};
