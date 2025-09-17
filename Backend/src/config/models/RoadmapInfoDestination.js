module.exports = (sequelize, DataTypes) => {
    let alias = "RoadmapInfoDestination";

    let cols = {
        id: {
            type: DataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        roadmap_info_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "roadmap_info",
                key: "id"
            },
        },
        destination: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    };

    let config = {
        tableName: "roadmap_info_destinations",
        timestamps: false,
    };

    const RoadmapInfoDestination = sequelize.define(alias, cols, config);

    RoadmapInfoDestination.associate = (models) => {
        RoadmapInfoDestination.belongsTo(models.RoadmapInfo, {
            foreignKey: "roadmap_info_id",
            as: "roadmap",
            onDelete: "CASCADE"
        });
    };

    return RoadmapInfoDestination;
};
