module.exports = (sequelize, dataTypes) => {
    let alias = 'BillSupplier';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        supplier: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        total_weight: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        head_quantity: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        quantity: {
            type: dataTypes.BIGINT(10),
            allowNull: false
        },
        romaneo_number: {
            type: dataTypes.BIGINT(10),
            allowNull: false
        },
        income_state: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        check_state: {
            type: dataTypes.BOOLEAN,
            allowNull: false
        },
        fresh_quantity: {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        fresh_weight: {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        production_process: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    };
    let config = {
        tableName: "bill_suppliers",
        timestamps: true,
    };
    const BillSupplier = sequelize.define(alias, cols, config);

    BillSupplier.associate = (models) => {
        BillSupplier.hasMany(models.BillDetail, {
            foreignKey: 'bill_supplier_id',
            as: 'billDetails'
        });
    };

    return BillSupplier;
};
