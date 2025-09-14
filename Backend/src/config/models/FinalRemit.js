module.exports = (sequelize, DataTypes) => {
    const FinalRemit = sequelize.define('FinalRemit', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        order_id: DataTypes.INTEGER,
        receipt_number: DataTypes.INTEGER,
        client_name: DataTypes.STRING(150),
        salesman_name: DataTypes.STRING(150),
        price_list: DataTypes.STRING(100),
        sell_condition: DataTypes.STRING(100),
        payment_condition: DataTypes.STRING(100),
        generated_by: DataTypes.ENUM('system', 'afip'),
        note: DataTypes.TEXT,
        total_items: DataTypes.INTEGER,
        total_amount: DataTypes.DECIMAL(10, 2),
    }, {
        tableName: 'final_remits',
        underscored: true
    });

    FinalRemit.associate = (models) => {
        FinalRemit.hasMany(models.FinalRemitProduct, {
            as: 'items',
            foreignKey: 'final_remit_id'
        });
    };

    return FinalRemit;
};
