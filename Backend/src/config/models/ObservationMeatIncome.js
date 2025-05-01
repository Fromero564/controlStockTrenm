module.exports = (sequelize, DataTypes) => {
    let alias = "ObservationsMeatIncome";

    let cols = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false, 
        },
      
        observation: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
       
    };

    let config = {
        tableName: "observations_meatincome",
        timestamps: false,
    };

    const ObservationsMeatIncome = sequelize.define(alias, cols, config);

   

    return ObservationsMeatIncome;
};
