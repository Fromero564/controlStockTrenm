module.exports = (sequelize, DataTypes) => {
    let alias = "MeatIncome";
    let cols = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_received_suppliers: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "received_suppliers", 
                key: "id",
            },
        },
        capon_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        media_res_capon_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        media_res_chancha_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        media_res_padrillo_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cabezas_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    };

    let config = {
        tableName: "meat_income",
        timestamps: false, 
    };

    const MeatIncome = sequelize.define(alias, cols, config);

    // Definir relaciones
    MeatIncome.associate = (models) => {
        MeatIncome.belongsTo(models.ReceivedSupplier, {
            foreignKey: "id_received_suppliers",
            as: "supplier", 
        });
    };

    return MeatIncome;
};
