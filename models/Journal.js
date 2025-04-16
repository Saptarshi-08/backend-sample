// models/Journal.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Journal = sequelize.define(
  "Journal",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    journalEntry: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    photos: {
      // Using an ARRAY to store multiple photo URLs – adjust as needed.
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    tags: {
      // Using an ARRAY to store multiple tags.
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "journals",
  }
);

module.exports = Journal;
