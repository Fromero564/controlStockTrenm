module.exports = (sequelize, DataTypes) => {
    const ProcessNumber = sequelize.define("ProcessNumber", {
        id: {
            type: DataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        process_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bill_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: "process_number",
        timestamps: false
    });

    ProcessNumber.associate = (models) => {
        ProcessNumber.hasMany(models.ProcessMeat, {
            foreignKey: "process_number",  
            sourceKey: "process_number"     
        });
    };

    return ProcessNumber;
};
