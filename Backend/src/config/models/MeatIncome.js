module.exports = (sequelize, dataTypes) => {
    let alias = "MeatIncome";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_received_suppliers: {
            type: dataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "bill_suppliers", 
                key: "id",
            },
        },
        products_name: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        products_quantity: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
      
    };

    let config = {
        tableName: "meat_income",
        timestamps: false, 
    };

    const MeatIncome = sequelize.define(alias, cols, config);

    // Definir relaciones
    MeatIncome.associate = (models) => {
        MeatIncome.belongsTo(models.BillSupplier, {
            foreignKey: "id_received_suppliers",
            as: "supplier", 
        });
    };

    return MeatIncome;
};
