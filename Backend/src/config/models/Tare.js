module.exports = (sequelize, dataTypes) => {
    let alias = "Tare";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tare_name: {
           type: dataTypes.STRING(255),
           allowNull: false
       },
       tare_weight: {
        type: dataTypes.FLOAT,
          allowNull: false
      },  
       
      
    };

    let config = {
        tableName: "tares",
        timestamps: false, 
    };

    const ProductsAvailable = sequelize.define(alias, cols, config);



    return ProductsAvailable ;
};
