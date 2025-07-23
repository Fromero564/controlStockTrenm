module.exports = (sequelize, DataTypes) => {
    let alias = "ProcessMeat";

    let cols = {
        id: {
            type: DataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.STRING(255),
            allowNull: false,

        },
        average: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        quantity: {
            type: DataTypes.BIGINT(10),
            allowNull: false
        },
        gross_weight: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        tares: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        net_weight: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        bill_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }

    }

    let config = {
        tableName: "process_meats",
        timestamps: false,
    };

    const ProcessMeat = sequelize.define(alias, cols, config);



    return ProcessMeat;
};
