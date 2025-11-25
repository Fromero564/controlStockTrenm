module.exports = (sequelize, dataTypes) => {
    let alias = 'Provider';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        provider_name: {
            type: dataTypes.STRING(255),
            allowNull: false
        },

        provider_type_id: {
            type: dataTypes.STRING(255),
            allowNull: false
        },

        provider_id_number: {
            type: dataTypes.STRING(20),
            allowNull: false
        },
        provider_iva_condition: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        provider_email: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        provider_phone: {
            type: dataTypes.STRING(20),
            allowNull: false
        },
        provider_adress: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        provider_country: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        provider_province: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        provider_location: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        provider_state: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },


    };



    let config = {
        tableName: "providers",
        timestamps: false,
    };
    const Provider = sequelize.define(alias, cols, config);


    return Provider

};
