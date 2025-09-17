module.exports = (sequelize, DataTypes) => {
    let alias = "RoadmapInfo";

    let cols = {
        id: {
            type: DataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        client_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        delivery_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        truck_license_plate: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        driver: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    };

    let config = {
        tableName: "roadmap_info",
        timestamps: false,
    };

    const RoadmapInfo = sequelize.define(alias, cols, config);

    RoadmapInfo.associate = (models) => {
        RoadmapInfo.hasMany(models.RoadmapInfoDestination, {
            foreignKey: "roadmap_info_id",
            as: "destinations",
            onDelete: "CASCADE"
        });
    };

    return RoadmapInfo;
};
