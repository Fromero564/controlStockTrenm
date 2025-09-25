module.exports = (sequelize, DataTypes) => {
    const Preinvoice = sequelize.define('Preinvoice', {
        receipt_number: DataTypes.STRING,
        final_remit_id: DataTypes.INTEGER,
        final_remit_item_id: DataTypes.INTEGER,
        product_id: DataTypes.STRING,
        product_name: DataTypes.STRING,
        unit_measure: DataTypes.STRING,
        expected_units: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
        expected_kg: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
        received_units: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
        received_kg: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
        note: DataTypes.TEXT,
    }, {
        tableName: 'preinvoices',
        underscored: true
    });

    Preinvoice.associate = (models) => {
        Preinvoice.hasMany(models.PreinvoiceReturn, {
            as: 'returns',
            foreignKey: 'preinvoice_id'
        });
    };

    return Preinvoice;
};
