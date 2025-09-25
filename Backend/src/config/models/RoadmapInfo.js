module.exports = (sequelize, DataTypes) => {
    const RoadmapInfo = sequelize.define("RoadmapInfo", {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        delivery_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        truck_license_plate: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        driver: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
    }, {
        tableName: "roadmap_info",
        timestamps: false,
    });

    RoadmapInfo.associate = (models) => {
        RoadmapInfo.hasMany(models.RoadmapInfoDestination, {
            foreignKey: "roadmap_info_id",
            as: "destinations",
            onDelete: "CASCADE",
        });
    };

    return RoadmapInfo;
};
