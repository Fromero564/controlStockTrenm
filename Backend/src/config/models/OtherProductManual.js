module.exports = (sequelize, DataTypes) => {
    let alias = "OtherProductManual";

    let cols = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        product_portion: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        product_quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
         product_gross_weight: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        product_net_weight: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        decrease: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        id_bill_suppliers: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "bill_suppliers",
                key: "id",
            },
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    };

    let config = {
        tableName: "other_product_manual", 
        timestamps: false,
    };

    const OtherProductManual = sequelize.define(alias, cols, config);

    OtherProductManual.associate = (models) => {
        OtherProductManual.belongsTo(models.BillSupplier, {
            foreignKey: "id_bill_suppliers",
            as: "supplier",
        });
    };

    return OtherProductManual;
};
