module.exports = (sequelize, dataTypes) => {
    const alias = 'CutsHeader';

    const cols = {
        id: { type: dataTypes.BIGINT(10).UNSIGNED, primaryKey: true, autoIncrement: true },
        receipt_number: { type: dataTypes.BIGINT(10), allowNull: false },
        product_code: { type: dataTypes.STRING(50), allowNull: false },
        product_name: { type: dataTypes.STRING(100), allowNull: false },
        unit_price: { type: dataTypes.DECIMAL(10, 2), allowNull: false },
        qty_requested: { type: dataTypes.INTEGER, allowNull: false },
        qty_weighed: { type: dataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        total_tare_weight: { type: dataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        total_gross_weight: { type: dataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        total_net_weight: { type: dataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        avg_weight: { type: dataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        qty_pending: { type: dataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    };

    const config = {
        tableName: 'cuts_header',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    };

    const CutsHeader = sequelize.define(alias, cols, config);

    CutsHeader.associate = (models) => {
        CutsHeader.hasMany(models.CutsDetail, {
            as: 'details',
            foreignKey: 'header_id',
        });
    };

    return CutsHeader;
};
