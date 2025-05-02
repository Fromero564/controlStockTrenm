module.exports = (sequelize, dataTypes) => {
    let alias = 'BillDetail'; 
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        bill_supplier_id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            allowNull: false,
            references: {
                model: 'bill_suppliers',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        type: dataTypes.STRING(255),
        quantity: dataTypes.INTEGER,
        heads: dataTypes.INTEGER,
        createdAt: dataTypes.DATE,
        updatedAt: dataTypes.DATE
    };

    let config = {
        tableName: 'bill_details',  
        timestamps: true
    };

    const BillDetail = sequelize.define(alias, cols, config);

    BillDetail.associate = (models) => {
        BillDetail.belongsTo(models.BillSupplier, {
            foreignKey: 'bill_supplier_id',
            as: 'billSupplier',
        });
    };

    return BillDetail;
};
