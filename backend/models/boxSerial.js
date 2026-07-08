module.exports = (sequelize, DataTypes) => {
  const BoxSerial = sequelize.define('BoxSerial', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serial: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'available'
    }
  }, {
    tableName: 'box_serials',
    timestamps: true,
    underscored: true
  });

  return BoxSerial;
};