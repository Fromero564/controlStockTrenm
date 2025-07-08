module.exports = (sequelize, DataTypes) => {
    let alias = "MeatIncome";

    let cols = {
         id: {
            type: DataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        id_bill_suppliers: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "bill_suppliers",
                key: "id",
            },
        },
        products_garron: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        products_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        products_quantity: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        product_head: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        provider_weight: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: false,
        },
        gross_weight: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: false,
        },
        tare: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: false,
        },
        net_weight: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: false,
        },
        decrease:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    };

    let config = {
        tableName: "meat_manual_income",
        timestamps: false,
    };

    const MeatIncome = sequelize.define(alias, cols, config);

    MeatIncome.associate = (models) => {
        MeatIncome.belongsTo(models.BillSupplier, {
            foreignKey: "id_bill_suppliers",
            as: "supplier",
        });
    };

    return MeatIncome;
};
