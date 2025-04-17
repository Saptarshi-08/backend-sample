// models/Postcard.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Postcard = sequelize.define(
  "Postcard",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    backgroundImage: {
      // the chosen background URL or path
      type: DataTypes.STRING,
      allowNull: false,
    },
    fontStyle: {
      type: DataTypes.ENUM("handwritten", "modern", "vintage"),
      allowNull: false,
      defaultValue: "handwritten",
    },
    stamp: {
      type: DataTypes.ENUM("classic", "travel", "none"),
      allowNull: false,
      defaultValue: "classic",
    },
    senderId: {
      // FK to User who sent it
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipientId: {
      // FK to User who receives it
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "postcards",
  }
);

module.exports = Postcard;
