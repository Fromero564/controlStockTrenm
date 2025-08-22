module.exports = (sequelize, dataTypes) => {
    let alias = 'Client';
    let cols = {
        id: {
            type: dataTypes.BIGINT(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        client_name: {
            type: dataTypes.STRING(255),
            allowNull: false
        },

        client_type_id: {
            type: dataTypes.STRING(255),
            allowNull: false
        },

        client_id_number: {
            type: dataTypes.BIGINT(10),
            allowNull: false
        },
        client_iva_condition: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        client_email: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        client_phone: {
            type: dataTypes.STRING(20),
            allowNull: false
        },
        client_adress: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        client_country: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        client_province: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        client_location: {
            type: dataTypes.STRING(255),
            allowNull: false
        },
        client_state: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
        },
        client_seller: {
            type: dataTypes.BIGINT(10),
            allowNull: true
        },
        client_payment_condition: {
            type: dataTypes.STRING(255),
            allowNull: true
        },
        client_sale_condition: {
            type: dataTypes.STRING(255),
            allowNull: true
        }

    };



    let config = {
        tableName: "clients",
        timestamps: false,
    };
    const Client = sequelize.define(alias, cols, config);


    return Client;

};
