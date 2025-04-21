// models/Lore.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

const Lore = sequelize.define(
  "Lore",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("Historical", "Cultural", "Folklore"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT, // Using TEXT to store base64 encoded images
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "lores",
  }
);

Lore.belongsTo(User, { as: "creator", foreignKey: "userId" });
module.exports = Lore;
