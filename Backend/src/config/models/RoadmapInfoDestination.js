module.exports = (sequelize, DataTypes) => {
    const RoadmapInfoDestination = sequelize.define("RoadmapInfoDestination", {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true, autoIncrement: true
        },
        roadmap_info_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        id_remit: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        client_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        destination: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
    }, {
        tableName: "roadmap_info_destinations",
        timestamps: false,
    });

    RoadmapInfoDestination.associate = (models) => {
        RoadmapInfoDestination.belongsTo(models.RoadmapInfo, {
            foreignKey: "roadmap_info_id",
            as: "roadmap",
        });
    };

    return RoadmapInfoDestination;
};
