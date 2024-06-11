const { Sequelize } = require("sequelize");
const { Client } = require("@elastic/elasticsearch");

const sequelize = new Sequelize("ykone", "ajay", "ajay@123", {
  host: "localhost:3306",
  dialect: "mysql",
  define: {
    timestamps: false,
  },
});

const esClient = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "Ajay@123",
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await esClient.indices.create(
      {
        index: "clients",
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
          },
          mappings: {
            properties: {
              cin: { type: "text" },
              name: { type: "text" },
              email: { type: "text" },
            },
          },
        },
      },
      { ignore: [400] }
    );
    console.log(
      "Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
