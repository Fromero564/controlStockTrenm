module.exports = (sequelize, dataTypes) => {
    let alias = "Seller";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: dataTypes.STRING(32),
            allowNull: false,
            unique: true,
        },
        name: {
            type: dataTypes.STRING(128),
            allowNull: false,
        },
        province: {
            type: dataTypes.STRING(64),
            allowNull: true,
        },
        city: {
            type: dataTypes.STRING(64),
            allowNull: true,
        },
        street: {
            type: dataTypes.STRING(80),
            allowNull: true,
        },
        number: {
            type: dataTypes.STRING(16),
            allowNull: true,
        },
        floor: {
            type: dataTypes.STRING(16),
            allowNull: true,
        },
        office: {
            type: dataTypes.STRING(32),
            allowNull: true,
        },
        created_at: {
            type: dataTypes.DATE,
            allowNull: false,
            defaultValue: dataTypes.NOW,
        },
        updated_at: {
            type: dataTypes.DATE,
            allowNull: false,
            defaultValue: dataTypes.NOW,
        }
    };

    let config = {
        tableName: "sellers",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    };

    const Seller = sequelize.define(alias, cols, config);
    return Seller;
};
